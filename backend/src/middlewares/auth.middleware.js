const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes.
 * Verifies the JWT token from the Authorization header.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Supabase has migrated to RS256 signing keys for new projects.
    // Standard jsonwebtoken with a symmetric secret (HS256) will throw "invalid algorithm".
    // The most robust way to verify is to use the Supabase Auth API.
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(500).json({
        status: 'error',
        message: 'Backend is missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables. Please add them to your backend .env file or hosting provider.',
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, ''); // remove trailing slash if any
    
    // Call Supabase to verify the token and get the user
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': process.env.SUPABASE_ANON_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token or session expired.',
        details: errorData,
      });
    }

    const userData = await response.json();

    // Attach user info to request
    req.user = {
      id: userData.id,
      email: userData.email,
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication.',
    });
  }
};

module.exports = { authenticate };
