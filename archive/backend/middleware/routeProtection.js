import jwt from "jsonwebtoken";

// Middleware to protect routes except for login, register, and root
const protectRoutes = (req, res, next) => {
  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/api/auth/login",
    "/api/auth/register",
    // Include static assets paths if needed
    "/css/",
    "/js/",
    "/images/",
  ];

  // Check if the current path is public
  const isPublicPath = publicPaths.some((path) => {
    if (path.endsWith("/")) {
      // For paths ending with '/', check if the request path starts with it
      return req.path.startsWith(path);
    }
    // For exact paths
    return req.path === path;
  });

  // If it's a public path, allow access
  if (isPublicPath) {
    return next();
  }

  // Otherwise, check for authentication token
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access denied. Please log in to continue." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token. Please log in again." });
  }
};

export default protectRoutes;