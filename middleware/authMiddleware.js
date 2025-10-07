import jwt from "jsonwebtoken";
import { User } from "../models/UserModel.js";

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    if (!req.user) {
      return res.status(401).json({ message: "Invalid token." });
    }
    if(!req.user.isActive){
      return res.status(404).json({ message: "Blcoked User" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token.", error });
  }
};

export default authMiddleware;
