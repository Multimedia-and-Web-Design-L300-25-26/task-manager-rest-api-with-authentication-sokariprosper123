import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 1. Extract token from Authorization header
// 2. Verify token
// 3. Find user
// 4. Attach user to req.user
// 5. Call next()
// 6. If invalid → return 401

const authMiddleware = async (req, res, next) => {
  let token;

  // 1. Extract token from Authorization header (Format: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find user (and hide the password field)
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // 4. Attach user to req.user
      req.user = user;

      // 5. Call next() to move to the controller
      return next();
    } catch (error) {
      // 6. If invalid (token expired or tampered with) → return 401
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // 6. If no token is provided at all → return 401
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export default authMiddleware;