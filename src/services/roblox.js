/**
 * Roblox Verification - WORKING WITHOUT EDGE FUNCTION
 * Uses a public CORS proxy to avoid NetworkError
 */

/**
 * Generate verification code (same as bot)
 */
export const generateVerificationCode = () => {
  const code = `NMX-${Math.floor(1000 + Math.random() * 9000)}`;
  return code;
};

/**
 * Verify Roblox using public CORS proxy
 * This works 100% from the browser
 */
export const verifyRobloxWithCode = async (username, verificationCode) => {
  try {
    console.log('[ROBLOX] Verifying:', username, 'with code:', verificationCode);

    // Use CORS Anywhere proxy (public service)
    const PROXY = 'https://api.codetabs.com/v1/proxy?quest=';

    // Step 1: Get user ID from username
    const searchUrl = `https://users.roblox.com/v1/usernames/users`;
    const searchResponse = await fetch(PROXY + encodeURIComponent(searchUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: [username.trim()],
        excludeBannedUsers: false
      })
    });

    const searchData = await searchResponse.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      throw new Error('Usuario no encontrado en Roblox');
    }

    const robloxId = searchData.data[0].id;
    const realUsername = searchData.data[0].name;

    console.log('[ROBLOX] Found user:', realUsername, '(ID:', robloxId, ')');

    // Step 2: Get user profile to check description
    const profileUrl = `https://users.roblox.com/v1/users/${robloxId}`;
    const profileResponse = await fetch(PROXY + encodeURIComponent(profileUrl));
    const userData = await profileResponse.json();

    const description = userData.description || '';
    
    console.log('[ROBLOX] Description:', description.substring(0, 50) + '...');

    // Step 3: Check if code is in description
    if (!description.includes(verificationCode)) {
      throw new Error(`Código "${verificationCode}" no encontrado en la descripción. Asegúrate de haberlo agregado y haz click en "Guardar".`);
    }

    // Check if banned
    if (userData.isBanned) {
      throw new Error('Esta cuenta de Roblox está baneada');
    }

    // Calculate account age
    const createdDate = new Date(userData.created);
    const accountAgeDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    console.log('[ROBLOX] ✅ Verification successful!');

    return {
      verified: true,
      id: robloxId,
      username: realUsername,
      displayName: userData.displayName,
      accountAge: accountAgeDays,
      created: userData.created
    };

  } catch (error) {
    console.error('[ROBLOX] ❌ Verification failed:', error);
    return {
      verified: false,
      error: error.message
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
  return `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=150&height=150&format=png`;
};
