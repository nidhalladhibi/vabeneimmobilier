// PropertyDetails.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Bed, Bath, Layers, Car, Calendar, Star, Shield, 
  Home, Wifi, Droplets, Wind, Tv, Utensils, Dumbbell, PawPrint, Coffee,
  Heart, Share2, Download, Check, ChevronLeft, ChevronRight, Maximize2,
  Phone, Mail, MessageCircle, Building2, Ruler, Award, Clock, Users,
  FileText, Settings, Zap, Thermometer, TreePine, Key, Lock, Camera,
  CalendarCheck, DollarSign, Square, Grid, Plus
} from "lucide-react";
import "../PropertyDetails.css";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [message, setMessage] = useState("");

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Déplacer fetchProperty en dehors de useEffect avec useCallback
  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/api/properties/${id}`);
      
      // Ensure arrays exist
      if (!Array.isArray(data.images)) data.images = [];
      if (!Array.isArray(data.amenities)) data.amenities = [];
      if (!Array.isArray(data.features)) data.features = [];
      
      setProperty(data);
      setError(null);
    } catch (err) {
      console.error("Erreur de chargement:", err);
      setError("Impossible de charger les détails de la propriété");
    } finally {
      setLoading(false);
    }
  }, [id, API_BASE_URL]); // Ajouter les dépendances

  useEffect(() => {
    fetchProperty();
    window.scrollTo(0, 0);
  }, [fetchProperty]); // Maintenant fetchProperty est stable

  // Fonction pour l'icône du type de propriété
  const getPropertyTypeIcon = (type) => {
    const icons = {
      appartement: "🏢",
      maison: "🏠",
      villa: "🏡",
      bureau: "💼",
      commerce: "🏪",
      terrain: "🌳",
      studio: "🔑",
      duplex: "🏘️"
    };
    return icons[type?.toLowerCase()] || "🏠";
  };

  // Fonction pour afficher les équipements
  const renderAmenities = (amenities) => {
    const allAmenities = [
      { id: "wifi", label: "WiFi", icon: <Wifi size={18} /> },
      { id: "climatisation", label: "Climatisation", icon: <Wind size={18} /> },
      { id: "chauffage", label: "Chauffage", icon: <Droplets size={18} /> },
      { id: "piscine", label: "Piscine", icon: "🏊‍♂️" },
      { id: "jardin", label: "Jardin", icon: "🌿" },
      { id: "garage", label: "Garage", icon: <Car size={18} /> },
      { id: "ascenseur", label: "Ascenseur", icon: "🛗" },
      { id: "securite", label: "Sécurité", icon: <Shield size={18} /> },
      { id: "gym", label: "Salle de sport", icon: <Dumbbell size={18} /> },
      { id: "parking", label: "Parking", icon: <Car size={18} /> },
      { id: "terrasse", label: "Terrasse", icon: "🌞" },
      { id: "balcon", label: "Balcon", icon: "🏙️" },
      { id: "tv", label: "Télévision", icon: <Tv size={18} /> },
      { id: "cuisine", label: "Cuisine équipée", icon: <Utensils size={18} /> },
      { id: "machine", label: "Machine à laver", icon: "🧺" },
      { id: "cafe", label: "Machine à café", icon: <Coffee size={18} /> },
      { id: "animaux", label: "Animaux acceptés", icon: <PawPrint size={18} /> },
    ];

    return allAmenities
      .filter(a => amenities?.includes(a.id))
      .map(a => (
        <div key={a.id} className="amenity-item">
          <span className="amenity-icon">{a.icon}</span>
          <span className="amenity-label">{a.label}</span>
        </div>
      ));
  };

  const formatPrice = (price) => {
    if (!price) return "-";
    return new Intl.NumberFormat("fr-TN", { 
      style: "currency", 
      currency: "TND", 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return "Date inconnue";
    return new Date(date).toLocaleDateString("fr-TN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return { label: 'Disponible', color: '#10b981', bg: '#e6f7f0' };
      case 'pending': return { label: 'En cours', color: '#f59e0b', bg: '#fff4e5' };
      case 'sold': return { label: 'Vendu', color: '#ef4444', bg: '#fee2e2' };
      case 'rented': return { label: 'Loué', color: '#3b82f6', bg: '#e6f0ff' };
      default: return { label: 'N/A', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const getCategoryBadge = (category) => {
    return category === 'vente' 
      ? { label: 'À VENDRE', color: '#3b82f6', bg: '#e6f0ff' }
      : { label: 'À LOUER', color: '#8b5cf6', bg: '#f3e8ff' };
  };

  const nextImage = () => {
    if (!property?.images?.length) return;
    setActiveImage((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!property?.images?.length) return;
    setActiveImage((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="property-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement de la propriété...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="property-error">
        <div className="error-content">
          <div className="error-icon">🏠</div>
          <h2>Propriété non trouvée</h2>
          <p>{error || "Cette propriété n'existe pas ou a été supprimée."}</p>
          <button onClick={() => navigate("/")} className="btn-primary">
            <ArrowLeft size={18} />
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const status = getStatusBadge(property.status);
  const category = getCategoryBadge(property.category);

  return (
    <div className="property-details-page">
      {/* Navigation Bar */}
      <div className="details-nav">
        <div className="nav-container">
          <button onClick={() => navigate(-1)} className="nav-back">
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>
          
          <div className="nav-actions">
            <button 
              className={`nav-action ${isFavorite ? 'active' : ''}`}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart size={20} />
            </button>
            <button className="nav-action">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section with Gallery */}
      <section className="property-hero">
        <div className="gallery-container">
          {/* Main Image */}
<div className="main-image-container">
  <img
    src={
      property.images && property.images.length > 0 && property.images[activeImage]
        ? `${API_BASE_URL}/${property.images[activeImage]}` // ✅ ajoute le slash
        : "/default.jpg" // image par défaut locale dans /public/default.jpg
    }
    alt={property.title || "Propriété"}
    className="main-image"
    onError={(e) => {
      e.target.src = "/default.jpg"; // fallback en cas d'erreur
    }}
  />
            
            {/* Image Navigation */}
            {property.images && property.images.length > 1 && (
              <>
                <button onClick={prevImage} className="image-nav prev">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextImage} className="image-nav next">
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            {property.images && property.images.length > 0 && (
              <div className="image-counter">
                <Camera size={16} />
                <span>{activeImage + 1} / {property.images.length}</span>
              </div>
            )}

            {/* Status Badges */}
            <div className="image-badges">
              <span className="badge-category" style={{ background: category.bg, color: category.color }}>
                {category.label}
              </span>
              <span className="badge-status" style={{ background: status.bg, color: status.color }}>
                {status.label}
              </span>
            </div>

            {/* Price Badge */}
            <div className="price-badge">
              <DollarSign size={20} />
              <span className="price-value">{formatPrice(property.price)}</span>
              {property.category === 'location' && <span className="price-period">/mois</span>}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {property.images && property.images.length > 1 && (
            <div className="thumbnail-gallery">
              {property.images.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  className={`thumbnail ${activeImage === idx ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img
                    src={`${API_BASE_URL}${img}`}
                    alt={`Thumbnail ${idx + 1}`}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80";
                    }}
                  />
                </button>
              ))}
              {property.images.length > 5 && (
                <div className="more-photos">
                  <Camera size={16} />
                  <span>+{property.images.length - 5}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Content Section */}
      <section className="property-content">
        <div className="content-container">
          {/* Main Content */}
          <div className="main-content">
            {/* Header */}
            <div className="property-header">
              <div className="header-left">
                <div className="property-type">
                  <span className="type-icon">{getPropertyTypeIcon(property.type)}</span>
                  <span className="type-label">{property.type || 'Propriété'}</span>
                </div>
                <h1 className="property-title">{property.title || "Sans titre"}</h1>
                <div className="property-location">
                  <MapPin size={18} />
                  <span>{property.location || "Localisation non spécifiée"}</span>
                </div>
              </div>
              
              <div className="header-right">
                <div className="property-id">
                  <span className="id-label">Référence</span>
                  <span className="id-value">#{property._id?.slice(-6) || "N/A"}</span>
                </div>
                <div className="property-date">
                  <Calendar size={16} />
                  <span>Publiée le {formatDate(property.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="key-features">
              <div className="feature-item">
                <Bed size={20} />
                <div className="feature-info">
                  <span className="feature-value">{property.bedrooms || 0}</span>
                  <span className="feature-label">Chambres</span>
                </div>
              </div>
              <div className="feature-item">
                <Bath size={20} />
                <div className="feature-info">
                  <span className="feature-value">{property.bathrooms || 0}</span>
                  <span className="feature-label">Salles de bain</span>
                </div>
              </div>
              <div className="feature-item">
                <Ruler size={20} />
                <div className="feature-info">
                  <span className="feature-value">{property.area || 0}</span>
                  <span className="feature-label">m²</span>
                </div>
              </div>
              <div className="feature-item">
                <Grid size={20} />
                <div className="feature-info">
                  <span className="feature-value">{property.rooms || 0}</span>
                  <span className="feature-label">Pièces</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="property-description">
              <h2>Description</h2>
              <p>{property.description || "Aucune description disponible."}</p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="property-amenities">
                <h2>Équipements et services</h2>
                <div className="amenities-grid">
                  {renderAmenities(property.amenities)}
                </div>
              </div>
            )}

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="property-features">
                <h2>Caractéristiques</h2>
                <div className="features-list">
                  {property.features.map((feature, index) => (
                    <div key={index} className="feature-tag">
                      <Check size={14} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="property-location-details">
              <h2>Localisation</h2>
              <div className="location-map">
                <div className="map-placeholder">
                  <MapPin size={32} />
                  <p>{property.location || "Localisation non spécifiée"}</p>
                  <button className="btn-outline">
                    Voir sur Google Maps
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="property-sidebar">
            {/* Agent Info */}
            <div className="agent-card">
              <div className="agent-avatar">
                <Users size={32} />
              </div>
              <div className="agent-info">
                <h3>Agent immobilier</h3>
                <p className="agent-name">Service Client</p>
                <p className="agent-agency">VABENE Immobilier</p>
                <div className="agent-stats">
                  <div className="stat">
                    <Award size={16} />
                    <span>Expert immobilier</span>
                  </div>
                  <div className="stat">
                    <Clock size={16} />
                    <span>Réponse sous 24h</span>
                  </div>
                </div>
              </div>
              <div className="agent-actions">
                <button className="btn-contact" onClick={() => setShowContactModal(true)}>
                  <MessageCircle size={18} />
                  Contacter
                </button>
                <button className="btn-phone">
                  <Phone size={18} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="actions-card">
              <h3>Actions</h3>
              <button className="action-btn favorite">
                <Heart size={18} />
                {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </button>
              <button className="action-btn pdf">
                <Download size={18} />
                Télécharger PDF
              </button>
              <button className="action-btn share">
                <Share2 size={18} />
                Partager
              </button>
            </div>

            {/* Similar Properties */}
            <div className="similar-card">
              <h3>Propriétés similaires</h3>
              <p className="text-muted">Chargement...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
            <motion.div 
              className="contact-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Contacter l'agent</h3>
                <button className="modal-close" onClick={() => setShowContactModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p className="modal-subtitle">Propriété: {property.title}</p>
                
                <div className="contact-methods">
                  <a href={`tel:+21651679495`} className="contact-method">
                    <div className="method-icon">
                      <Phone size={20} />
                    </div>
                    <div className="method-details">
                      <span className="method-label">Téléphone</span>
                      <span className="method-value">+216 51 679 495</span>
                    </div>
                  </a>
                  
                  <a href={`mailto:contact@vabene.tn`} className="contact-method">
                    <div className="method-icon">
                      <Mail size={20} />
                    </div>
                    <div className="method-details">
                      <span className="method-label">Email</span>
                      <span className="method-value">contact@vabene.tn</span>
                    </div>
                  </a>
                  
                  <a href={`https://wa.me/21651679495`} className="contact-method">
                    <div className="method-icon">
                      <MessageCircle size={20} />
                    </div>
                    <div className="method-details">
                      <span className="method-label">WhatsApp</span>
                      <span className="method-value">+216 51 679 495</span>
                    </div>
                  </a>
                </div>
                
                <textarea
                  className="message-input"
                  placeholder="Votre message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
                
                <button className="btn-send">
                  Envoyer le message
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyDetails;