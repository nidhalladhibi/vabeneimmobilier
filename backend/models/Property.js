import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Prix & catégorie
    price: { type: Number, required: true },
    currency: { type: String, default: "TND" },
    category: { type: String, enum: ["vente", "location"], default: "vente" },
    commission: { type: String },
    deposit: { type: String },

    // Localisation
    location: { type: String, required: true },
    address: { type: String },
    latitude: { type: String },
    longitude: { type: String },
    neighborhood: { type: String },
    city: { type: String },

    // Détails du bien
    type: { type: String, default: "appartement" },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    area: { type: Number },
    yearBuilt: { type: Number },
    parkingSpaces: { type: Number },
    floors: { type: Number },

    // Équipements
    amenities: [{ type: String }],

    // Médias
    images: [{ type: String }], // Array of image paths
    videos: [{ type: String }],
    virtualTour: { type: String },

    // Contact
    contactName: { type: String },
    contactPhone: { type: String },
    contactEmail: { type: String },
    whatsappEnabled: { type: Boolean, default: true },

    // Options supplémentaires
    furnished: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    availableFrom: { type: Date },
    featured: { type: Boolean, default: false },
    status: { type: String, default: "disponible" },

    // Méta
    views: { type: Number, default: 0 },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", PropertySchema);
export default Property;