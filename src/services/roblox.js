/**
 * Roblox Service - Ultra Simple Version
 * No API calls, no verification - just validation
 */

/**
 * Generate code (not used but kept for UI)
 */
export const generateVerificationCode = () => {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `VERIFY-${code}`;
};

/**
 * Ultra simple - just validate format
 */
export const verifyRobloxWithCode = async (username) => {
  // Just validate username format
  const cleaned = username.trim();
  
  if (cleaned.length < 3 || cleaned.length > 20) {
    return {
      verified: false,
      error: 'El nombre debe tener entre 3 y 20 caracteres'
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(cleaned)) {
    return {
      verified: false,
      error: 'Solo letras, números y guiones bajos'
    };
  }

  // Simulate loading for UX
  await new Promise(resolve => setTimeout(resolve, 800));

  // Always succeed with valid format
  return {
    verified: true,
    id: Math.floor(Math.random() * 1000000000),
    username: cleaned,
    displayName: cleaned,
    accountAge: 0,
    created: new Date().toISOString()
  };
};

/**
 * Simple avatar
 */
export const getRobloxAvatar = (username) => {
  const letter = username ? username.charAt(0).toUpperCase() : 'R';
  return `https://ui-avatars.com/api/?name=${letter}&background=0D8ABC&color=fff&size=150&bold=true`;
};
