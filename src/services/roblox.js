/**
 * Roblox Verification Service - Temporary simple version
 * Uses basic validation until Edge Function is deployed
 */

/**
 * Generate unique verification code
 */
export const generateVerificationCode = () => {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `VERIFY-${code}`;
};

/**
 * Simple Roblox verification (temporary - until Edge Function deployed)
 */
export const verifyRobloxWithCode = async (username, verificationCode) => {
  try {
    // Basic validation
    if (!username || username.trim().length < 3) {
      throw new Error('Nombre de usuario inválido');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      throw new Error('El nombre solo puede contener letras, números y guiones bajos');
    }

    // Simulate successful verification
    // TODO: This will be replaced by real Edge Function verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate random user ID for now
    const fakeId = Math.floor(Math.random() * 1000000000);

    return {
      verified: true,
      id: fakeId,
      username: username.trim(),
      displayName: username.trim(),
      accountAge: 30, // Placeholder
      created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'Verificación simplificada - Edge Function pendiente'
    };
  } catch (error) {
    return {
      verified: false,
      error: error.message
    };
  }
};

/**
 * Get Roblox avatar placeholder
 */
export const getRobloxAvatar = async (userId) => {
  const letter = String(userId).charAt(0);
  return `https://ui-avatars.com/api/?name=${letter}&background=0D8ABC&color=fff&size=150&bold=true`;
};
