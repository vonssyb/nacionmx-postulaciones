/**
 * Roblox API Verification Service
 * Uses Roblox APIs that support CORS
 */

export const verifyRobloxUser = async (username) => {
  try {
    if (!username || username.trim().length === 0) {
      throw new Error('Por favor ingresa un nombre de usuario');
    }

    // Step 1: Use Roblox API v1 endpoint (supports CORS)
    const response = await fetch(
      `https://users.roblox.com/v1/usernames/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: false
        })
      }
    );

    if (!response.ok) {
      throw new Error('Error al conectar con Roblox');
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error('Usuario de Roblox no encontrado. Verifica que el nombre sea correcto.');
    }

    const userId = data.data[0].id;
    const exactUsername = data.data[0].name;

    // Step 2: Get detailed user info
    const userResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    
    if (!userResponse.ok) {
      throw new Error('No se pudo obtener información del usuario');
    }

    const userData = await userResponse.json();

    // Step 3: Check if banned
    if (userData.isBanned) {
      throw new Error('Esta cuenta de Roblox está baneada');
    }

    // Step 4: Calculate account age
    const createdDate = new Date(userData.created);
    const accountAgeDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    // Step 5: Check minimum age - REDUCED to 1 day for testing
    if (accountAgeDays < 1) {
      throw new Error(`La cuenta debe tener al menos 1 día (tiene ${accountAgeDays} días)`);
    }

    return {
      verified: true,
      id: userId,
      username: exactUsername,
      displayName: userData.displayName,
      accountAge: accountAgeDays,
      created: userData.created,
      isBanned: userData.isBanned,
      description: userData.description || ''
    };
  } catch (error) {
    console.error('Error verificando Roblox:', error);
    return {
      verified: false,
      error: error.message || 'Error al verificar cuenta de Roblox'
    };
  }
};

/**
 * Get Roblox user avatar
 */
export const getRobloxAvatar = async (userId) => {
  try {
    const response = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
    );
    
    if (!response.ok) {
      throw new Error('No se pudo cargar el avatar');
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0 && data.data[0].imageUrl) {
      return data.data[0].imageUrl;
    }

    // Fallback avatar
    return `https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=150`;
  } catch (error) {
    console.error('Error obteniendo avatar:', error);
    return `https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=150`;
  }
};
