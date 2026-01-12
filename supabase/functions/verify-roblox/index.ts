import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, verificationCode } = await req.json()

    if (!username || !verificationCode) {
      return new Response(
        JSON.stringify({ error: 'Username and verification code required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 1: Get user ID from username
    const searchResponse = await fetch(
      `https://users.roblox.com/v1/usernames/users`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
      }
    )

    if (!searchResponse.ok) {
      throw new Error('Failed to search for user')
    }

    const searchData = await searchResponse.json()

    if (!searchData.data || searchData.data.length === 0) {
      return new Response(
        JSON.stringify({ verified: false, error: 'Usuario no encontrado' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = searchData.data[0].id
    const exactUsername = searchData.data[0].name

    // Step 2: Get user details
    const userResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`)
    const userData = await userResponse.json()

    if (userData.isBanned) {
      return new Response(
        JSON.stringify({ verified: false, error: 'Esta cuenta está baneada' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 3: Check if verification code is in description
    const description = (userData.description || '').toLowerCase()
    const code = verificationCode.toLowerCase()

    if (!description.includes(code)) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'Código no encontrado en la descripción. Asegúrate de haberlo agregado.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 4: Calculate account age
    const createdDate = new Date(userData.created)
    const accountAgeDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

    // Success!
    return new Response(
      JSON.stringify({
        verified: true,
        id: userId,
        username: exactUsername,
        displayName: userData.displayName,
        accountAge: accountAgeDays,
        created: userData.created
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
