import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Accès refusé" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
    const user = await User.findById(decoded.userId)
    req.user = user; // ✅ Associer userId
    console.log(req.user)
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide" });
  }
};
