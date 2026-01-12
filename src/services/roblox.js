/**
 * Roblox Verification Service - Uses Supabase Edge Function
 */

import { supabase } from './supabase';

/**
 * Generate unique verification code
 */
export const generateVerificationCode = () => {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `VERIFY-${code}`;
};

/**
 * Verify Roblox account with code using Edge Function
 */
export const verifyRobloxWithCode = async (username, verificationCode) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-roblox', {
      body: {
        username,
        verificationCode
      }
    });

    if (error) {
      throw new Error(error.message || 'Error al verificar');
    }

    return data;
  } catch (error) {
    return {
      verified: false,
      error: error.message
    };
  }
};

/**
 * Get Roblox avatar
 */
export const getRobloxAvatar = async (userId) => {
  try {
    const response = await fetch(
      `https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
    );
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0 && data.data[0].imageUrl) {
      return data.data[0].imageUrl.replace('t0.rbxcdn.com', 't0.roproxy.com');
    }

    return `https://ui-avatars.com/api/?name=${userId}&background=0D8ABC&color=fff&size=150`;
  } catch (error) {
    return `https://ui-avatars.com/api/?name=R&background=0D8ABC&color=fff&size=150`;
  }
};
