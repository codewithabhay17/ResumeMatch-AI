/**
 * Backend input validation middleware
 * Validates all incoming requests
 */

/**
 * Email validation
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate registration input
 */
function validateRegisterInput(email, name, password, confirmPassword) {
  const errors = [];

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Invalid email format');
  }

  // Name validation
  if (!name) {
    errors.push('Name is required');
  } else if (name.length < 2 || name.length > 100) {
    errors.push('Name must be between 2 and 100 characters');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  } else if (password.length > 128) {
    errors.push('Password is too long');
  }

  // Confirm password validation
  if (!confirmPassword) {
    errors.push('Password confirmation is required');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate login input
 */
function validateLoginInput(email, password) {
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Invalid email format');
  }

  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Invalid email or password');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string input (prevent SQL injection, XSS)
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate pagination input
 */
function validatePagination(limit, offset) {
  const maxLimit = 100;
  const minLimit = 1;

  let validLimit = parseInt(limit) || 20;
  let validOffset = parseInt(offset) || 0;

  if (isNaN(validLimit) || validLimit < minLimit || validLimit > maxLimit) {
    validLimit = 20;
  }

  if (isNaN(validOffset) || validOffset < 0) {
    validOffset = 0;
  }

  return { limit: validLimit, offset: validOffset };
}

/**
 * Validate search query
 */
function validateSearchQuery(query) {
  const errors = [];

  if (!query) {
    errors.push('Search query is required');
  } else if (typeof query !== 'string') {
    errors.push('Search query must be a string');
  } else if (query.length < 2) {
    errors.push('Search query must be at least 2 characters');
  } else if (query.length > 200) {
    errors.push('Search query is too long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Middleware: Validate request body
 */
function validateRequestBody(req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request body',
      });
    }
    next();
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid JSON in request body',
    });
  }
}

/**
 * Middleware: Sanitize request data
 */
function sanitizeRequestData(req, res, next) {
  try {
    if (req.body && typeof req.body === 'object') {
      Object.keys(req.body).forEach((key) => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeString(req.body[key]);
        }
      });
    }
    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error processing request',
    });
  }
}

module.exports = {
  isValidEmail,
  validateRegisterInput,
  validateLoginInput,
  sanitizeString,
  validatePagination,
  validateSearchQuery,
  validateRequestBody,
  sanitizeRequestData,
};
