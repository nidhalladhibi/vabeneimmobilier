import Property from "../models/Property.js";
import mongoose from "mongoose";

// ✅ Récupérer toutes les propriétés
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur serveur GET", error: error.message });
  }
};

// ✅ Récupérer les propriétés par owner
export const getPropertiesByOwner = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur Owner",
      error: error.message,
      user: req.user,
    });
  }
};

// ✅ Récupérer une propriété par ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Propriété non trouvée" });
    }
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur get by id",
      error: error.message,
    });
  }
};

// ✅ Récupérer des propriétés similaires
export const getRelatedProperties = async (req, res) => {
  try {
    const { id } = req.params;
    const baseProperty = await Property.findById(id);

    if (!baseProperty) {
      return res.status(404).json({ message: "Propriété de référence introuvable" });
    }

    const query = {
      _id: { $ne: baseProperty._id },
    };

    if (baseProperty.city) {
      query.city = baseProperty.city;
    } else if (baseProperty.location) {
      query.location = baseProperty.location;
    }

    const related = await Property.find(query).limit(6);
    return res.status(200).json(related);
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur related",
      error: error.message,
    });
  }
};

// ✅ Incrémenter le nombre de vues
export const trackView = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: "Propriété non trouvée" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur track view",
      error: error.message,
    });
  }
};

// ✅ Ajouter une nouvelle propriété
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      category,
      type,
      currency,
      deposit,
      commission,
      address,
      latitude,
      longitude,
      neighborhood,
      city,
      bedrooms,
      bathrooms,
      area,
      yearBuilt,
      parkingSpaces,
      floors,
      amenities,
      virtualTour,
      contactName,
      contactPhone,
      contactEmail,
      whatsappEnabled,
      furnished,
      petFriendly,
      availableFrom,
      featured,
      status,
    } = req.body;

    if (!title || !description || !price || !location) {
      return res
        .status(400)
        .json({ message: "Tous les champs obligatoires sont requis" });
    }

    // Parse amenities si envoyé en JSON (depuis le frontend)
    let amenitiesParsed = [];
    if (amenities) {
      try {
        amenitiesParsed = Array.isArray(amenities)
          ? amenities
          : JSON.parse(amenities);
      } catch {
        amenitiesParsed = [];
      }
    }

    // Save the paths of uploaded images
    const images = req.files?.map((file) => file.path) || [];

    const newProperty = new Property({
      title,
      description,
      price,
      location,
      category,
      type,
      currency,
      deposit,
      commission,
      address,
      latitude,
      longitude,
      neighborhood,
      city,
      bedrooms,
      bathrooms,
      area,
      yearBuilt,
      parkingSpaces,
      floors,
      amenities: amenitiesParsed,
      images,
      virtualTour,
      contactName,
      contactPhone,
      contactEmail,
      whatsappEnabled: whatsappEnabled !== "false" && whatsappEnabled !== false,
      furnished: furnished === "true" || furnished === true,
      petFriendly: petFriendly === "true" || petFriendly === true,
      availableFrom: availableFrom || undefined,
      featured: featured === "true" || featured === true,
      status: status || "disponible",
      owner: req.user._id,
    });

    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur creation",
      error: error.message,
    });
  }
};

// ✅ Modifier une propriété
export const updateProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      category,
      type,
      currency,
      deposit,
      commission,
      address,
      latitude,
      longitude,
      neighborhood,
      city,
      bedrooms,
      bathrooms,
      area,
      yearBuilt,
      parkingSpaces,
      floors,
      amenities,
      virtualTour,
      contactName,
      contactPhone,
      contactEmail,
      whatsappEnabled,
      furnished,
      petFriendly,
      availableFrom,
      featured,
      status,
    } = req.body;

    let amenitiesParsed = [];
    if (amenities) {
      try {
        amenitiesParsed = Array.isArray(amenities)
          ? amenities
          : JSON.parse(amenities);
      } catch {
        amenitiesParsed = [];
      }
    }

    const updatedProperty = await Property.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      {
        title,
        description,
        price,
        location,
        category,
        type,
        currency,
        deposit,
        commission,
        address,
        latitude,
        longitude,
        neighborhood,
        city,
        bedrooms,
        bathrooms,
        area,
        yearBuilt,
        parkingSpaces,
        floors,
        amenities: amenitiesParsed,
        virtualTour,
        contactName,
        contactPhone,
        contactEmail,
        whatsappEnabled: whatsappEnabled !== "false" && whatsappEnabled !== false,
        furnished: furnished === "true" || furnished === true,
        petFriendly: petFriendly === "true" || petFriendly === true,
        availableFrom: availableFrom || undefined,
        featured: featured === "true" || featured === true,
        status: status || "disponible",
      },
      { new: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ message: "Propriété non trouvée" });
    }

    res.status(200).json(updatedProperty);
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur update",
      error: error.message,
    });
  }
};

// ✅ Supprimer une propriété
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!property) {
      return res.status(404).json({ message: "Propriété non trouvée." });
    }

    await property.deleteOne();
    res.json({ message: "Propriété supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur serveur delete" });
  }
};
