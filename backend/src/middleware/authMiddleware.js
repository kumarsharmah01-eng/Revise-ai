import jwt from "jsonwebtoken";
import User from "../models/user.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({
        message: "Access denied. Invalid token.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Support tokens signed with either `id` or `userId`
    const userId = decoded.id || decoded.userId;

    // Select BOTH verification fields so it works with either schema
    const user = await User.findById(userId).select(
      "_id isVerified emailVerified",
    );

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    // Logic change: verified if EITHER field is true
    const verified = user.isVerified === true || user.emailVerified === true;

    if (!verified) {
      return res.status(403).json({ message: "Email not verified." });
    }

    // Keep both names so existing controllers keep working
    req.user = {
      id: String(user._id),
      userId: String(user._id),
      _id: user._id,
    };

    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please log in again." });
    }

    return res
      .status(401)
      .json({ message: "Invalid token. Please log in again." });
  }
};

export default authMiddleware;
