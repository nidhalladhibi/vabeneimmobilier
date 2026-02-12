import { transporter } from "../config/emailConfig.js";
import Property from "../models/Property.js";

// POST /api/contact
export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message, propertyId } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Nom, email et message sont obligatoires.",
      });
    }

    let property = null;
    if (propertyId) {
      property = await Property.findById(propertyId).lean();
    }

    const toEmail =
      (property && property.contactEmail) ||
      process.env.CONTACT_EMAIL ||
      process.env.EMAIL_USER;

    if (!toEmail) {
      return res.status(500).json({
        message:
          "Aucune adresse de réception configurée pour les messages de contact.",
      });
    }

    const htmlMessage = `
      <h2>Nouveau message de contact depuis Vabene Immobilier</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Téléphone :</strong> ${phone || "Non renseigné"}</p>
      ${
        property
          ? `<p><strong>Propriété :</strong> ${property.title || ""} (${property._id})</p>`
          : ""
      }
      <p><strong>Message :</strong></p>
      <p>${message}</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Nouveau message de contact - Vabene Immobilier",
      html: htmlMessage,
    });

    return res.status(200).json({
      success: true,
      message: "Message envoyé avec succès.",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message de contact:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de l'envoi du message.",
      error: error.message,
    });
  }
};


