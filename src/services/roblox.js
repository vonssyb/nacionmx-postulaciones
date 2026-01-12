/**
 * Roblox Verification Service - Real database lookup
 * Queries Supabase for verified Roblox accounts from Discord
 */

import { supabase } from './supabase';

/**
 * Get verified Roblox username from Discord verification database
 */
export const getVerifiedRobloxFromDiscord = async (discordId) => {
  try {
    console.log('🔍 Searching for Roblox verification for Discord ID:', discordId);

    // Check citizens table first (main verification table)
    const { data: citizen, error: citizenError } = await supabase
      .from('citizens')
      .select('*')
      .eq('discord_id', discordId)
      .maybeSingle();

    console.log('Citizens query result:', { citizen, citizenError });

    if (citizen && citizen.roblox_username) {
      console.log('✅ Found in citizens table:', citizen.roblox_username);
      return {
        verified: true,
        username: citizen.roblox_username,
        id: citizen.roblox_id || null,
        source: 'citizens',
        message: 'Cuenta verificada desde Discord (/verificar)'
      };
    }

    // Fallback: check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('discord_id', discordId)
      .maybeSingle();

    console.log('Profiles query result:', { profile, profileError });

    if (profile && profile.roblox_username) {
      console.log('✅ Found in profiles table:', profile.roblox_username);
      return {
        verified: true,
        username: profile.roblox_username,
        id: profile.roblox_id || null,
        source: 'profiles',
        message: 'Cuenta verificada desde Discord'
      };
    }

    // Not verified yet
    console.log('❌ No Roblox verification found');
    return {
      verified: false,
      error: 'No tienes una cuenta de Roblox verificada. Usa /verificar en Discord primero.',
      needsVerification: true
    };

  } catch (error) {
    console.error('❌ Error fetching verified Roblox:', error);
    return {
      verified: false,
      error: 'Error al buscar verificación: ' + error.message
    };
  }
};

/**
 * Manual verification fallback - DO NOT USE, should always verify from Discord
 */
export const verifyRobloxManual = async (username) => {
  return {
    verified: false,
    error: 'Debes verificar tu cuenta de Roblox en Discord usando /verificar primero'
  };
};

/**
 * Get avatar placeholder
 */
export const getRobloxAvatar = async (username) => {
  const firstLetter = username ? username.charAt(0).toUpperCase() : 'R';
  return `https://ui-avatars.com/api/?name=${firstLetter}&background=0D8ABC&color=fff&size=150&bold=true`;
};
