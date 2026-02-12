import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import UserAttends from "../models/userattends.js";
import dotenv from "dotenv";

dotenv.config();


// Inscription d'un nouvel utilisateur
export const register = async (req, res) => {
  try {
    const { name, email, password, companyName, address, professionalEmail, phone } = req.body;

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du nouvel utilisateur avec les nouveaux champs
    const newUser = new UserAttends({ 
      name, 
      email, 
      password: hashedPassword,
      companyName, 
      address, 
      professionalEmail, 
      phone ,
      role: 'user'
    });
    await newUser.save();

    // Réponse avec succès
    res.status(201).json({ message: "Votre démande a été envoyés avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer plus tard" });
  }
};


// Connexion de l'utilisateur
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe dans la collection User (approuvés)
    let user = await User.findOne({ email });
    
    if (!user) {
      // Si pas trouvé dans User, vérifier dans UserAttends (en attente d'approbation)
      const pendingUser = await UserAttends.findOne({ email });
      if (pendingUser) {
        return res.status(403).json({ message: "Votre compte est en attente d'approbation par un administrateur." });
      }
      return res.status(400).json({ message: "Utilisateur non trouvé avec cet email" });
    }

    // Comparaison du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Création du token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });

    // Réponse avec token et informations de l'utilisateur
    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer plus tard" });
  }
};

