/**
 * Roblox Verification Service - Code-based verification
 * Similar to Bloxlink/RoVer verification system
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
 * Get Roblox user by username
 */
export const getRobloxUser = async (username) => {
  try {
    // Use RoProxy for CORS-friendly access
    const response = await fetch(
      `https://users.roproxy.com/v1/usernames/users`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: false
        })
      }
    );

    if (!response.ok) {
      throw new Error('No se pudo conectar con Roblox');
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    const userId = data.data[0].id;
    const exactUsername = data.data[0].name;

    // Get full user info
    const userResponse = await fetch(`https://users.roproxy.com/v1/users/${userId}`);
    const userData = await userResponse.json();

    return {
      success: true,
      id: userId,
      username: exactUsername,
      displayName: userData.displayName,
      description: userData.description || '',
      created: userData.created,
      isBanned: userData.isBanned
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify Roblox account with code
 */
export const verifyRobloxWithCode = async (username, verificationCode) => {
  try {
    const userResult = await getRobloxUser(username);

    if (!userResult.success) {
      throw new Error(userResult.error);
    }

    if (userResult.isBanned) {
      throw new Error('Esta cuenta está baneada');
    }

    // Check if verification code is in description
    const description = userResult.description.toLowerCase();
    const code = verificationCode.toLowerCase();

    if (!description.includes(code)) {
      throw new Error('Código de verificación no encontrado en la descripción. Asegúrate de haberlo agregado y guarda los cambios.');
    }

    // Calculate account age
    const createdDate = new Date(userResult.created);
    const accountAgeDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      verified: true,
      id: userResult.id,
      username: userResult.username,
      displayName: userResult.displayName,
      accountAge: accountAgeDays,
      created: userResult.created
    };
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

// Legacy functions removed - no database lookup
export const getVerifiedRobloxFromDiscord = async () => {
  return { verified: false, needsVerification: true };
};

export const verifyRobloxManual = async () => {
  return { verified: false };
};
