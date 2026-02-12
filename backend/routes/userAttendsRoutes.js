import { Router } from "express";
import UserAttends from "../models/userattends.js";
import User from "../models/User.js";
import { transporter, verifyEmailConfig } from "../config/emailConfig.js";

const router = Router();

verifyEmailConfig();

// GET all users
router.get("/", async (req, res) => {
  try {
    const userAttends = await UserAttends.find();
    const users = await User.find();

    const pending = userAttends.map((user) => ({
      ...user.toObject(),
      status: "En attente",
    }));

    const approved = users.map((user) => ({
      ...user.toObject(),
      status: "Approuvé",
    }));

    res.json([...pending, ...approved]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// APPROVE
router.patch("/approve/:id", async (req, res) => {
  try {
    const user = await UserAttends.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const newUser = new User({
      name: user.name,
      email: user.email,
      password: user.password,
      role: "user",
    });

    await newUser.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Compte approuvé",
      html: `<h2>Bonjour ${user.name}</h2><p>Votre compte est approuvé.</p>`,
    });

    await UserAttends.findByIdAndDelete(user._id);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// REJECT
router.patch("/reject/:id", async (req, res) => {
  try {
    const user = await UserAttends.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Compte refusé",
      html: `<p>Désolé ${user.name}, votre demande est refusée.</p>`,
    });

    await UserAttends.findByIdAndDelete(user._id);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
