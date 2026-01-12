/**
 * Roblox Username - Simple Storage (No API Verification)
 * Admin can verify manually later
 */

export const verifyRobloxUser = async (username) => {
  try {
    if (!username || username.trim().length === 0) {
      throw new Error('Por favor ingresa tu nombre de usuario de Roblox');
    }

    // Simple validation - just check format
    const cleaned = username.trim();
    
    if (cleaned.length < 3 || cleaned.length > 20) {
      throw new Error('El nombre de usuario debe tener entre 3 y 20 caracteres');
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9_]+$/.test(cleaned)) {
      throw new Error('El nombre de usuario solo puede contener letras, números y guiones bajos');
    }

    // Return "verified" immediately without API call
    return {
      verified: true,
      id: null, // Will be verified by admin
      username: cleaned,
      displayName: cleaned,
      accountAge: null,
      created: null,
      isBanned: false,
      description: 'Pendiente de verificación manual'
    };
  } catch (error) {
    return {
      verified: false,
      error: error.message
    };
  }
};

/**
 * Get placeholder avatar
 */
export const getRobloxAvatar = async (username) => {
  // Return a placeholder based on username
  const firstLetter = username ? username.charAt(0).toUpperCase() : 'R';
  return `https://ui-avatars.com/api/?name=${firstLetter}&background=0D8ABC&color=fff&size=150&bold=true`;
};
