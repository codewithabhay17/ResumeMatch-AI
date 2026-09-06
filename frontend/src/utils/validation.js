/**
 * Input validation utilities
 * Validates all user inputs on the frontend
 */

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/; // At least 1 lowercase, 1 uppercase, 1 digit

/**
 * Validate email format
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (trimmedEmail.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }
  
  return { valid: true, value: trimmedEmail };
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }
  
  // For MVP, just require minimum length. For production, use PASSWORD_REGEX
  // if (!PASSWORD_REGEX.test(password)) {
  //   return { valid: false, error: 'Password must contain uppercase, lowercase, and numbers' };
  // }
  
  return { valid: true };
}

/**
 * Validate name/username
 */
export function validateName(name) {
  if (!name) {
    return { valid: false, error: 'Name is required' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (trimmedName.length > 100) {
    return { valid: false, error: 'Name is too long' };
  }
  
  // Prevent special characters
  if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }
  
  return { valid: true, value: trimmedName };
}

/**
 * Validate password confirmation
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }
  
  return { valid: true };
}

/**
 * Validate file upload
 */
export function validateFile(file, maxSize = 5242880) {
  if (!file) {
    return { valid: false, error: 'File is required' };
  }
  
  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` };
  }
  
  // Check file type
  const allowedTypes = ['application/pdf', 'text/plain'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PDF and text files are allowed' };
  }
  
  return { valid: true };
}

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate search query
 */
export function validateSearchQuery(query) {
  if (!query) {
    return { valid: false, error: 'Search query is required' };
  }
  
  const trimmedQuery = query.trim();
  
  if (trimmedQuery.length < 2) {
    return { valid: false, error: 'Search query must be at least 2 characters' };
  }
  
  if (trimmedQuery.length > 100) {
    return { valid: false, error: 'Search query is too long' };
  }
  
  return { valid: true, value: trimmedQuery };
}

/**
 * Validate pagination params
 */
export function validatePagination(limit, offset) {
  const maxLimit = 100;
  const minLimit = 1;
  
  let validLimit = parseInt(limit) || 20;
  let validOffset = parseInt(offset) || 0;
  
  if (validLimit < minLimit || validLimit > maxLimit) {
    validLimit = 20;
  }
  
  if (validOffset < 0) {
    validOffset = 0;
  }
  
  return { limit: validLimit, offset: validOffset };
}

export default {
  validateEmail,
  validatePassword,
  validateName,
  validatePasswordMatch,
  validateFile,
  sanitizeInput,
  validateSearchQuery,
  validatePagination,
};
