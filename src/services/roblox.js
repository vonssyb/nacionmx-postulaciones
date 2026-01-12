/**
 * Roblox API Verification Service with CORS Proxy
 * Uses proxy to bypass CORS restrictions
 */

// Use CORS proxy for client-side requests
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export const verifyRobloxUser = async (username) => {
  try {
    if (!username || username.trim().length === 0) {
      throw new Error('Por favor ingresa un nombre de usuario');
    }

    // Step 1: Search for user by username
    const searchUrl = `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=1`;
    const searchRes = await fetch(CORS_PROXY + encodeURIComponent(searchUrl));
    
    if (!searchRes.ok) {
      throw new Error('Error al conectar con Roblox API');
    }

    const searchData = await searchRes.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      throw new Error('Usuario de Roblox no encontrado');
    }

    const userId = searchData.data[0].id;

    // Step 2: Get full user details
    const userUrl = `https://users.roblox.com/v1/users/${userId}`;
    const userRes = await fetch(CORS_PROXY + encodeURIComponent(userUrl));
    
    if (!userRes.ok) {
      throw new Error('No se pudo obtener información del usuario');
    }

    const userData = await userRes.json();

    // Step 3: Check if account is banned
    if (userData.isBanned) {
      throw new Error('Esta cuenta de Roblox está baneada');
    }

    // Step 4: Calculate account age in days
    const createdDate = new Date(userData.created);
    const accountAgeDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    // Step 5: Check minimum account age (7 days)
    if (accountAgeDays < 7) {
      throw new Error(`La cuenta debe tener al menos 7 días (tiene ${accountAgeDays} días)`);
    }

    return {
      verified: true,
      id: userId,
      username: userData.name,
      displayName: userData.displayName,
      accountAge: accountAgeDays,
      created: userData.created,
      isBanned: userData.isBanned,
      description: userData.description || ''
    };
  } catch (error) {
    console.error('Roblox verification error:', error);
    return {
      verified: false,
      error: error.message || 'Error desconocido al verificar cuenta'
    };
  }
};

/**
 * Get Roblox user avatar thumbnail
 */
export const getRobloxAvatar = async (userId) => {
  try {
    const avatarUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png`;
    const res = await fetch(CORS_PROXY + encodeURIComponent(avatarUrl));
    const data = await res.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0].imageUrl;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Roblox avatar:', error);
    // Return default placeholder
    return `https://ui-avatars.com/api/?name=${userId}&background=0D8ABC&color=fff&size=150`;
  }
};
