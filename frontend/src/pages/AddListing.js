import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import {
  Upload,
  Camera,
  X,
  Home,
  MapPin,
  DollarSign,
  FileText,
  Bed,
  Bath,
  Layers,
  Car,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Video,
  ChevronRight,
  Globe,
  Phone
} from "lucide-react";
import "../AddListing.css";

const AddListing = () => {
  const navigate = useNavigate();
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    title: "",
    description: "",
    category: "vente", // 'vente' or 'location'
    type: "appartement",
    
    // Price & Details
    price: "",
    currency: "TND",
    deposit: "",
    commission: "",
    
    // Location
    location: "",
    address: "",
    latitude: "",
    longitude: "",
    neighborhood: "",
    city: "",
    
    // Features
    bedrooms: "",
    bathrooms: "",
    area: "",
    yearBuilt: "",
    parkingSpaces: "",
    floors: "",
    
    // Amenities
    amenities: [],
    
    // Media
    images: [],
    videos: [],
    virtualTour: "",
    
    // Contact
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    whatsappEnabled: true,
    
    // Additional
    furnished: false,
    petFriendly: false,
    availableFrom: "",
    featured: false,
    status: "disponible"
  });
  
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    error: false,
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  const propertyTypes = [
    { value: "appartement", label: "Appartement", icon: "🏢" },
    { value: "maison", label: "Maison", icon: "🏠" },
    { value: "villa", label: "Villa", icon: "🏡" },
    { value: "bureau", label: "Bureau", icon: "💼" },
    { value: "commerce", label: "Local commercial", icon: "🏪" },
    { value: "terrain", label: "Terrain", icon: "🌳" },
    { value: "studio", label: "Studio", icon: "🔑" },
    { value: "duplex", label: "Duplex", icon: "🏘️" },
  ];

  const amenitiesList = [
    { id: "wifi", label: "WiFi", icon: "📶" },
    { id: "climatisation", label: "Climatisation", icon: "❄️" },
    { id: "chauffage", label: "Chauffage", icon: "🔥" },
    { id: "piscine", label: "Piscine", icon: "🏊" },
    { id: "jardin", label: "Jardin", icon: "🌿" },
    { id: "garage", label: "Garage", icon: "🚗" },
    { id: "ascenseur", label: "Ascenseur", icon: "🛗" },
    { id: "securite", label: "Sécurité 24/7", icon: "👮" },
    { id: "gym", label: "Salle de sport", icon: "💪" },
    { id: "parking", label: "Parking", icon: "🅿️" },
    { id: "terrasse", label: "Terrasse", icon: "🌞" },
    { id: "balcon", label: "Balcon", icon: "🏙️" },
  ];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle drag events for file upload
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  // Process selected files
  const handleFiles = (files) => {
    const newImages = [];
    const newPreviews = [];
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        newImages.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          setImagePreviews(prev => [...prev, ...newPreviews]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    setImages(prev => [...prev, ...newImages]);
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Toggle amenity
  const toggleAmenity = (amenityId) => {
    setFormData(prev => {
      const amenities = prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId];
      return { ...prev, amenities };
    });
  };

  // Validate current step
  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 1) {
      if (!formData.title.trim()) newErrors.title = "Le titre est requis";
      if (!formData.description.trim()) newErrors.description = "La description est requise";
      if (!formData.type) newErrors.type = "Le type de propriété est requis";
      if (!formData.category) newErrors.category = "La catégorie est requise";
    }
    
    if (stepNumber === 2) {
      if (!formData.price) newErrors.price = "Le prix est requis";
      if (!formData.location.trim()) newErrors.location = "La localisation est requise";
      if (!formData.address.trim()) newErrors.address = "L'adresse est requise";
      if (!formData.area) newErrors.area = "La superficie est requise";
    }
    
    if (stepNumber === 3 && images.length === 0) {
      newErrors.images = "Au moins une image est requise";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next step
  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(step)) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus({ success: false, error: false, message: "" });
    
    const formDataToSend = new FormData();
    
    // Append form data
    Object.keys(formData).forEach(key => {
      if (key === 'amenities') {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    // Append images
    images.forEach((image, index) => {
      formDataToSend.append("images", image);
    });
    
    // Append videos
    videos.forEach((video, index) => {
      formDataToSend.append("videos", video);
    });
    
    try {
      const token = localStorage.getItem("token") || Cookies.get("token");
      
      const response = await axios.post(
        `${API_BASE_URL}/api/properties`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      setSubmitStatus({
        success: true,
        error: false,
        message: "Annonce ajoutée avec succès ! Redirection en cours...",
      });
      
      // Redirect after delay
      setTimeout(() => {
        navigate(`/property/${response.data._id}`);
      }, 3000);
      
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'annonce", error);
      
      let errorMessage = "Erreur lors de l'ajout de l'annonce";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors)[0];
      }
      
      setSubmitStatus({
        success: false,
        error: true,
        message: errorMessage,
      });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4].map((stepNumber) => (
        <div key={stepNumber} className="step-item">
          <div className={`step-circle ${step === stepNumber ? 'active' : step > stepNumber ? 'completed' : ''}`}>
            {step > stepNumber ? <CheckCircle size={16} /> : stepNumber}
          </div>
          <span className="step-label">
            {stepNumber === 1 && "Infos de base"}
            {stepNumber === 2 && "Détails"}
            {stepNumber === 3 && "Médias"}
            {stepNumber === 4 && "Contact"}
          </span>
          {stepNumber < 4 && <div className="step-line"></div>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="add-listing-page">
      {/* Header */}
      <header className="listing-header">
        <div className="container">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Retour
          </button>
          <h1>Publier une annonce</h1>
          <p>Remplissez les informations pour publier votre propriété</p>
        </div>
      </header>

      <div className="listing-container">
        <div className="listing-wrapper">
          {/* Step Indicator */}
          <StepIndicator />

          <form onSubmit={handleSubmit} className="listing-form">
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="form-step"
                >
                  <h2>Informations de base</h2>
                  
                  <div className="form-group">
                    <label htmlFor="title">
                      <FileText size={18} />
                      <span>Titre de l'annonce *</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Ex: Magnifique appartement au centre-ville"
                      className={`modern-input ${errors.title ? 'error' : ''}`}
                    />
                    {errors.title && (
                      <div className="error-message">
                        <AlertCircle size={14} />
                        {errors.title}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">
                      <FileText size={18} />
                      <span>Description détaillée *</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Décrivez votre propriété en détails..."
                      rows={5}
                      className={`modern-textarea ${errors.description ? 'error' : ''}`}
                    />
                    <div className="char-count">
                      {formData.description.length}/2000 caractères
                    </div>
                    {errors.description && (
                      <div className="error-message">
                        <AlertCircle size={14} />
                        {errors.description}
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="category">
                        <DollarSign size={18} />
                        <span>Catégorie *</span>
                      </label>
                      <div className="category-selector">
                        <button
                          type="button"
                          className={`category-btn ${formData.category === 'vente' ? 'active' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, category: 'vente' }))}
                        >
                          À vendre
                        </button>
                        <button
                          type="button"
                          className={`category-btn ${formData.category === 'location' ? 'active' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, category: 'location' }))}
                        >
                          À louer
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="type">
                        <Home size={18} />
                        <span>Type de propriété *</span>
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className={`modern-select ${errors.type ? 'error' : ''}`}
                      >
                        <option value="">Sélectionnez un type</option>
                        {propertyTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <div className="error-message">
                          <AlertCircle size={14} />
                          {errors.type}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Details & Location */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="form-step"
                >
                  <h2>Détails et localisation</h2>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="price">
                        <DollarSign size={18} />
                        <span>Prix *</span>
                      </label>
                      <div className="price-input">
                        <input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="Ex: 250000"
                          className={`modern-input ${errors.price ? 'error' : ''}`}
                        />
                        <select
                          name="currency"
                          value={formData.currency}
                          onChange={handleChange}
                          className="currency-select"
                        >
                          <option value="TND">TND</option>
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                      {errors.price && (
                        <div className="error-message">
                          <AlertCircle size={14} />
                          {errors.price}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="area">
                        <Layers size={18} />
                        <span>Superficie (m²) *</span>
                      </label>
                      <input
                        id="area"
                        name="area"
                        type="number"
                        value={formData.area}
                        onChange={handleChange}
                        placeholder="Ex: 120"
                        className={`modern-input ${errors.area ? 'error' : ''}`}
                      />
                      {errors.area && (
                        <div className="error-message">
                          <AlertCircle size={14} />
                          {errors.area}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="bedrooms">
                        <Bed size={18} />
                        <span>Chambres</span>
                      </label>
                      <input
                        id="bedrooms"
                        name="bedrooms"
                        type="number"
                        value={formData.bedrooms}
                        onChange={handleChange}
                        placeholder="Ex: 3"
                        className="modern-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="bathrooms">
                        <Bath size={18} />
                        <span>Salles de bain</span>
                      </label>
                      <input
                        id="bathrooms"
                        name="bathrooms"
                        type="number"
                        value={formData.bathrooms}
                        onChange={handleChange}
                        placeholder="Ex: 2"
                        className="modern-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="parkingSpaces">
                        <Car size={18} />
                        <span>Places de parking</span>
                      </label>
                      <input
                        id="parkingSpaces"
                        name="parkingSpaces"
                        type="number"
                        value={formData.parkingSpaces}
                        onChange={handleChange}
                        placeholder="Ex: 1"
                        className="modern-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">
                      <MapPin size={18} />
                      <span>Localisation *</span>
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Ex: Tunis, Lac 2"
                      className={`modern-input ${errors.location ? 'error' : ''}`}
                    />
                    {errors.location && (
                      <div className="error-message">
                        <AlertCircle size={14} />
                        {errors.location}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">
                      <MapPin size={18} />
                      <span>Adresse complète *</span>
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Ex: 123 Avenue Habib Bourguiba"
                      className={`modern-input ${errors.address ? 'error' : ''}`}
                    />
                    {errors.address && (
                      <div className="error-message">
                        <AlertCircle size={14} />
                        {errors.address}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <Home size={18} />
                      <span>Équipements</span>
                    </label>
                    <div className="amenities-grid">
                      {amenitiesList.map(amenity => (
                        <button
                          key={amenity.id}
                          type="button"
                          className={`amenity-btn ${formData.amenities.includes(amenity.id) ? 'selected' : ''}`}
                          onClick={() => toggleAmenity(amenity.id)}
                        >
                          <span className="amenity-icon">{amenity.icon}</span>
                          <span className="amenity-label">{amenity.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <div className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          id="furnished"
                          name="furnished"
                          checked={formData.furnished}
                          onChange={handleChange}
                          className="modern-checkbox"
                        />
                        <label htmlFor="furnished">Meublé</label>
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          id="petFriendly"
                          name="petFriendly"
                          checked={formData.petFriendly}
                          onChange={handleChange}
                          className="modern-checkbox"
                        />
                        <label htmlFor="petFriendly">Animaux acceptés</label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Media Upload */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="form-step"
                >
                  <h2>Photos et vidéos</h2>
                  
                  <div className="form-group">
                    <label>
                      <Camera size={18} />
                      <span>Photos de la propriété *</span>
                    </label>
                    
                    <div
                      className={`upload-area ${dragActive ? 'drag-active' : ''} ${errors.images ? 'error' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        id="images"
                        name="images"
                        onChange={handleFileSelect}
                        accept="image/*"
                        multiple
                        className="file-input"
                      />
                      <div className="upload-content">
                        <Upload size={48} />
                        <h4>Glissez vos photos ici</h4>
                        <p>ou cliquez pour parcourir</p>
                        <p className="upload-hint">
                          Formats acceptés: JPG, PNG, WebP (Max 10MB par image)
                        </p>
                      </div>
                    </div>
                    
                    {errors.images && (
                      <div className="error-message">
                        <AlertCircle size={14} />
                        {errors.images}
                      </div>
                    )}

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="image-previews">
                        <h5>Photos sélectionnées ({imagePreviews.length})</h5>
                        <div className="preview-grid">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="preview-item">
                              <img src={preview} alt={`Preview ${index}`} />
                              <button
                                type="button"
                                className="remove-image"
                                onClick={() => removeImage(index)}
                              >
                                <X size={16} />
                              </button>
                              {index === 0 && (
                                <div className="primary-badge">Principale</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="videos">
                      <Video size={18} />
                      <span>Vidéos (optionnel)</span>
                    </label>
                    <input
                      type="file"
                      id="videos"
                      name="videos"
                      accept="video/*"
                      onChange={(e) => setVideos(Array.from(e.target.files))}
                      className="modern-input"
                    />
                    {videos.length > 0 && (
                      <div className="video-previews">
                        {videos.map((video, index) => (
                          <div key={index} className="video-preview">
                            <Video size={20} />
                            <span>{video.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="virtualTour">
                      <Globe size={18} />
                      <span>Visite virtuelle (optionnel)</span>
                    </label>
                    <input
                      id="virtualTour"
                      name="virtualTour"
                      type="url"
                      value={formData.virtualTour}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="modern-input"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 4: Contact Information */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="form-step"
                >
                  <h2>Informations de contact</h2>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="contactName">
                        <FileText size={18} />
                        <span>Nom du contact *</span>
                      </label>
                      <input
                        id="contactName"
                        name="contactName"
                        type="text"
                        value={formData.contactName}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        className="modern-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="contactPhone">
                        <Phone size={18} />
                        <span>Téléphone *</span>
                      </label>
                      <input
                        id="contactPhone"
                        name="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        placeholder="+216 XX XXX XXX"
                        className="modern-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactEmail">
                      <FileText size={18} />
                      <span>Email de contact</span>
                    </label>
                    <input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="contact@email.com"
                      className="modern-input"
                    />
                  </div>

                  <div className="form-group">
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        id="whatsappEnabled"
                        name="whatsappEnabled"
                        checked={formData.whatsappEnabled}
                        onChange={handleChange}
                        className="modern-checkbox"
                      />
                      <label htmlFor="whatsappEnabled">
                        Activer WhatsApp pour les demandes
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="availableFrom">
                      <Calendar size={18} />
                      <span>Disponible à partir de</span>
                    </label>
                    <input
                      id="availableFrom"
                      name="availableFrom"
                      type="date"
                      value={formData.availableFrom}
                      onChange={handleChange}
                      className="modern-input"
                    />
                  </div>

                  <div className="form-group">
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        id="featured"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        className="modern-checkbox"
                      />
                      <label htmlFor="featured">
                        Mettre en avant cette annonce
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success/Error Messages */}
            {submitStatus.success && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="success-message"
              >
                <CheckCircle size={24} />
                <div>
                  <h4>Succès !</h4>
                  <p>{submitStatus.message}</p>
                </div>
              </motion.div>
            )}

            {submitStatus.error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="error-message"
              >
                <AlertCircle size={24} />
                <div>
                  <h4>Erreur</h4>
                  <p>{submitStatus.message}</p>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="form-navigation">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="nav-button prev-button"
                >
                  ← Précédent
                </button>
              )}
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="nav-button next-button"
                >
                  Continuer
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`nav-button submit-button ${isSubmitting ? 'loading' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="spinner" size={20} />
                      <span>Publication en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Publier l'annonce</span>
                      <CheckCircle size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddListing;