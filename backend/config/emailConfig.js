import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou un autre service d'email comme SendGrid, Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER, // utilisez des variables d'environnement
    pass: process.env.EMAIL_PASS  // utilisez des variables d'environnement
  },
  // Options supplémentaires pour la sécurité et la fiabilité
  tls: {
    rejectUnauthorized: false // utile en développement si vous avez des problèmes de certificat
  }
});

// Fonction utilitaire pour vérifier la connexion au serveur SMTP au démarrage de l'application
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Connexion au serveur SMTP établie avec succès');
  } catch (error) {
    console.error('Erreur de connexion au serveur SMTP:', error);
  }
};

export { transporter, verifyEmailConfig };