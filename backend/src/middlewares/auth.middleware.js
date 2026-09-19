const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes.
 * Verifies the JWT token from the Authorization header.
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    
    console.log('[Auth] Token length:', token.length);
    // console.log('[Auth] Token prefix:', token.substring(0, 15));
    // console.log('[Auth] Secret length:', process.env.JWT_SECRET?.length);
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.log('[Auth] Standard verify failed:', err.message);
      // Try decoding base64 if standard string verification fails (common with new Supabase secrets)
      // Some Supabase JWT secrets are base64 encoded strings
      // if it ends with ==
      console.log('[Auth] Trying Base64 decode for secret...');
      const secretBytes = Buffer.from(process.env.JWT_SECRET, 'base64');
      decoded = jwt.verify(token, secretBytes);
    }

    // Attach user info to request (Supabase JWT uses 'sub' for user ID)
    req.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: `Invalid token. Reason: ${error.message}`,
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired. Please log in again.',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

module.exports = { authenticate };
