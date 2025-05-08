import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate JWT tokens
 * This will be used to protect routes that require authentication
 */
export const authenticate = (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    // Check if the header exists and starts with Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Authentication required. No token provided or invalid format.'
      });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the user data to the request
    req.user = decoded;
    
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Middleware to restrict access to admin users only
 * Must be used after the authenticate middleware
 */
export const adminOnly = (req, res, next) => {
  // Check if user exists and is an admin
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      message: 'Access denied. Admin privileges required.'
    });
  }
  
  next();
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't reject the request if no token
 */
export const optionalAuthenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // If there's an error with the token, just continue without setting user
    next();
  }
}; 