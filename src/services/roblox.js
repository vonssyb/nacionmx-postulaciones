/**
 * Roblox Verification Service - Uses existing Discord verification data
 * Queries Supabase for already verified Roblox accounts
 */

import { supabase } from './supabase';

/**
 * Get verified Roblox username from Discord verification database
 */
export const getVerifiedRobloxFromDiscord = async (discordId) => {
  try {
    // Check citizens table first (main verification table)
    const { data: citizen, error: citizenError } = await supabase
      .from('citizens')
      .select('roblox_username, roblox_id')
      .eq('discord_id', discordId)
      .single();

    if (!citizenError && citizen && citizen.roblox_username) {
      return {
        verified: true,
        username: citizen.roblox_username,
        id: citizen.roblox_id,
        source: 'citizens',
        message: 'Cuenta verificada desde Discord'
      };
    }

    // Fallback: check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('roblox_username')
      .eq('discord_id', discordId)
      .single();

    if (!profileError && profile && profile.roblox_username) {
      return {
        verified: true,
        username: profile.roblox_username,
        id: null,
        source: 'profiles',
        message: 'Cuenta verificada desde Discord'
      };
    }

    // Not verified yet
    return {
      verified: false,
      error: 'No tienes una cuenta de Roblox verificada en Discord. Usa /verificar en el servidor.',
      needsVerification: true
    };

  } catch (error) {
    console.error('Error fetching verified Roblox:', error);
    return {
      verified: false,
      error: 'Error al buscar verificación: ' + error.message
    };
  }
};

/**
 * Manual verification fallback (for users not yet verified in Discord)
 */
export const verifyRobloxManual = async (username) => {
  try {
    if (!username || username.trim().length === 0) {
      throw new Error('Por favor ingresa tu nombre de usuario de Roblox');
    }

    const cleaned = username.trim();
    
    if (cleaned.length < 3 || cleaned.length > 20) {
      throw new Error('El nombre de usuario debe tener entre 3 y 20 caracteres');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleaned)) {
      throw new Error('El nombre de usuario solo puede contener letras, números y guiones bajos');
    }

    return {
      verified: true,
      id: null,
      username: cleaned,
      displayName: cleaned,
      accountAge: null,
      created: null,
      isBanned: false,
      description: 'Verificación manual - Pendiente de confirmación'
    };
  } catch (error) {
    return {
      verified: false,
      error: error.message
    };
  }
};

/**
 * Get avatar placeholder
 */
export const getRobloxAvatar = async (username) => {
  const firstLetter = username ? username.charAt(0).toUpperCase() : 'R';
  return `https://ui-avatars.com/api/?name=${firstLetter}&background=0D8ABC&color=fff&size=150&bold=true`;
};
