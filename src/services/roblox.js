/**
 * Roblox Verification Service
 * Uses Supabase Edge Function (same logic as Discord bot /verificar command)
 */

import { supabase } from './supabase';

/**
 * Generate verification code (same format as Discord bot)
 */
export const generateVerificationCode = () => {
  // Same format as bot: NMX-XXXX (4 digits)
  const code = `NMX-${Math.floor(1000 + Math.random() * 9000)}`;
  return code;
};

/**
 * Verify Roblox with code using Edge Function
 * Replicates exact logic from bot/commands/moderation/verificar.js
 */
export const verifyRobloxWithCode = async (username, verificationCode) => {
  try {
    console.log('[WEB] Calling Edge Function:', { username, verificationCode });

    const { data, error } = await supabase.functions.invoke('verify-roblox', {
      body: {
        username: username.trim(),
        verificationCode: verificationCode
      }
    });

    if (error) {
      console.error('[WEB] Edge Function error:', error);
      throw new Error(error.message || 'Error al verificar');
    }

    console.log('[WEB] Edge Function response:', data);
    return data;

  } catch (error) {
    console.error('[WEB] Verification error:', error);
    return {
      verified: false,
      error: error.message || 'Error al conectar con el servidor de verificación'
    };
  }
};

/**
 * Get Roblox avatar
 */
export const getRobloxAvatar = (userId) => {
  if (!userId) {
    return `https://ui-avatars.com/api/?name=R&background=0D8ABC&color=fff&size=150&bold=true`;
  }
  // Same URL format as bot
  return `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=150&height=150&format=png`;
};
