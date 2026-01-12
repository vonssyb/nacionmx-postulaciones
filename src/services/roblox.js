/**
 * Roblox User Verification Service
 * Uses User ID instead of username for better reliability
 */

export const verifyRobloxUser = async (userIdOrUsername) => {
  try {
    if (!userIdOrUsername || userIdOrUsername.trim().length === 0) {
      throw new Error('Por favor ingresa tu User ID o nombre de usuario');
    }

    let userId;
    
    // Check if input is a number (User ID) or string (username)
    if (/^\d+$/.test(userIdOrUsername.trim())) {
      // It's a User ID
      userId = parseInt(userIdOrUsername.trim());
    } else {
      // It's a username - try to get ID via RoProxy (CORS-friendly proxy)
      try {
        const response = await fetch(
          `https://users.roproxy.com/v1/usernames/users`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              usernames: [userIdOrUsername.trim()],
              excludeBannedUsers: false
            })
          }
        );

        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
          throw new Error('Usuario no encontrado. Por favor usa tu User ID numérico en su lugar.');
        }

        userId = data.data[0].id;
      } catch (err) {
        throw new Error('No se pudo verificar el nombre de usuario. Por favor usa tu User ID numérico (lo encuentras en tu perfil de Roblox).');
      }
    }

    // Get user details using RoProxy
    const userResponse = await fetch(`https://users.roproxy.com/v1/users/${userId}`);
    
    if (!userResponse.ok) {
      throw new Error('No se encontró el usuario con ese ID. Verifica que sea correcto.');
    }

    const userData = await userResponse.json();

    // Check if banned
    if (userData.isBanned) {
      throw new Error('Esta cuenta de Roblox está baneada');
    }

    // Calculate account age
    const createdDate = new Date(userData.created);
    const accountAgeDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    // Minimum 1 day
    if (accountAgeDays < 1) {
      throw new Error(`La cuenta debe tener al menos 1 día (tiene ${accountAgeDays} días)`);
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
    console.error('Error verificando Roblox:', error);
    return {
      verified: false,
      error: error.message || 'Error al verificar cuenta de Roblox'
    };
  }
};

/**
 * Get Roblox avatar using RoProxy
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
    console.error('Error obteniendo avatar:', error);
    return `https://ui-avatars.com/api/?name=${userId}&background=0D8ABC&color=fff&size=150`;
  }
};
