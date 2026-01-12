// Deno Edge Function para verificar Roblox (igual que el bot)
// Usa la misma lógica que bot/commands/moderation/verificar.js

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, verificationCode } = await req.json()

    if (!username || !verificationCode) {
      return new Response(
        JSON.stringify({ verified: false, error: 'Username y código requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[VERIFY] Checking ${username} with code ${verificationCode}`)

    // Step 1: Get Roblox ID from username (igual que línea 28 del bot)
    const robloxRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false
      })
    })

    if (!robloxRes.ok) {
      throw new Error('Error al buscar usuario en Roblox')
    }

    const robloxData = await robloxRes.json()

    if (!robloxData.data || robloxData.data.length === 0) {
      return new Response(
        JSON.stringify({ verified: false, error: 'Usuario no encontrado en Roblox' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const robloxId = robloxData.data[0].id
    const realUsername = robloxData.data[0].name

    console.log(`[VERIFY] Found user: ${realUsername} (ID: ${robloxId})`)

    // Step 2: Get full user profile to check description (igual que línea 82 del bot)
    const userProfileRes = await fetch(`https://users.roblox.com/v1/users/${robloxId}`)
    
    if (!userProfileRes.ok) {
      throw new Error('Error al obtener perfil de Roblox')
    }

    const userData = await userProfileRes.json()
    const description = userData.description || ''

    console.log(`[VERIFY] Description: ${description.substring(0, 50)}...`)

    // Step 3: Check if verification code is in description (igual que línea 85 del bot)
    if (!description.includes(verificationCode)) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: `Código "${verificationCode}" no encontrado en la descripción. Asegúrate de haberlo agregado y que sea visible públicamente.` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[VERIFY] Code verified! ✅`)

    // Step 4: Calculate account age
    const createdDate = new Date(userData.created)
    const accountAgeDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

    // Check if banned
    if (userData.isBanned) {
      return new Response(
        JSON.stringify({ verified: false, error: 'Esta cuenta de Roblox está baneada' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Success! Return verified data
    return new Response(
      JSON.stringify({
        verified: true,
        id: robloxId,
        username: realUsername,
        displayName: userData.displayName,
        accountAge: accountAgeDays,
        created: userData.created
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[VERIFY] Error:', error)
    return new Response(
      JSON.stringify({ verified: false, error: error.message || 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
