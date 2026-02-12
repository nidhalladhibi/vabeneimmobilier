import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "react-bootstrap";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  MapPin,
  Phone,
  Globe,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  Home,
  Shield,
  ChevronRight,
  BadgeCheck,
  TrendingUp,
  Users,
  Target
} from "lucide-react";
import "../Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Informations personnelles
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Informations professionnelles
    companyName: "",
    businessType: "Agence",
    address: "",
    professionalEmail: "",
    phone: "",
    website: "",
    businessDescription: "",
    // Conditions
    termsAccepted: false,
    newsletter: false
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

  const businessTypes = [
    { value: "Agence", label: "Agence immobilière", icon: "🏢" },
    { value: "Promoteur", label: "Promoteur immobilier", icon: "🏗️" },
    { value: "Indépendant", label: "Agent indépendant", icon: "👤" },
    { value: "Constructeur", label: "Constructeur", icon: "🏠" },
    { value: "Gestionnaire", label: "Gestionnaire de biens", icon: "📋" },
    { value: "Autre", label: "Autre", icon: "🔧" }
  ];

  useEffect(() => {
    // Calculate password strength
    if (formData.password) {
      let strength = 0;
      if (formData.password.length >= 8) strength += 25;
      if (/[A-Z]/.test(formData.password)) strength += 25;
      if (/[0-9]/.test(formData.password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field) => {
    let error = '';
    
    switch (field) {
      case 'name':
        if (!formData.name.trim()) {
          error = "Le nom est requis";
        } else if (formData.name.length < 2) {
          error = "Le nom doit contenir au moins 2 caractères";
        }
        break;
      
      case 'email':
        if (!formData.email.trim()) {
          error = "L'email est requis";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          error = "Format d'email invalide";
        }
        break;
      
      case 'password':
        if (!formData.password) {
          error = "Le mot de passe est requis";
        } else if (formData.password.length < 8) {
          error = "Le mot de passe doit contenir au moins 8 caractères";
        } else if (!/[A-Z]/.test(formData.password)) {
          error = "Le mot de passe doit contenir au moins une majuscule";
        } else if (!/[0-9]/.test(formData.password)) {
          error = "Le mot de passe doit contenir au moins un chiffre";
        }
        break;
      
      case 'confirmPassword':
        if (formData.password !== formData.confirmPassword) {
          error = "Les mots de passe ne correspondent pas";
        }
        break;
      
      case 'companyName':
        if (!formData.companyName.trim()) {
          error = "Le nom de l'entreprise est requis";
        }
        break;
      
      case 'professionalEmail':
        if (!formData.professionalEmail.trim()) {
          error = "L'email professionnel est requis";
        } else if (!/\S+@\S+\.\S+/.test(formData.professionalEmail)) {
          error = "Format d'email invalide";
        }
        break;
      
      case 'phone':
        if (!formData.phone.trim()) {
          error = "Le numéro de téléphone est requis";
        } else if (!/^[0-9+\-\s()]{8,20}$/.test(formData.phone)) {
          error = "Numéro de téléphone invalide";
        }
        break;
      
      case 'address':
        if (!formData.address.trim()) {
          error = "L'adresse est requise";
        }
        break;
      
      default:
        break;
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 1) {
      if (!formData.name.trim()) newErrors.name = "Le nom est requis";
      if (!formData.email.trim()) newErrors.email = "L'email est requis";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Format d'email invalide";
      if (!formData.password) newErrors.password = "Le mot de passe est requis";
      if (!formData.confirmPassword) newErrors.confirmPassword = "Confirmez votre mot de passe";
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    
    if (stepNumber === 2) {
      if (!formData.companyName.trim()) newErrors.companyName = "Le nom de l'entreprise est requis";
      if (!formData.professionalEmail.trim()) newErrors.professionalEmail = "L'email professionnel est requis";
      else if (!/\S+@\S+\.\S+/.test(formData.professionalEmail)) newErrors.professionalEmail = "Format d'email invalide";
      if (!formData.phone.trim()) newErrors.phone = "Le numéro de téléphone est requis";
      if (!formData.address.trim()) newErrors.address = "L'adresse est requise";
    }
    
    if (stepNumber === 3 && !formData.termsAccepted) {
      newErrors.termsAccepted = "Vous devez accepter les conditions d'utilisation";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      setStep(3);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Remove confirmPassword from data sent to server
      const { confirmPassword, termsAccepted, newsletter, ...registerData } = formData;
      
      const _response = await axios.post(
        `${API_BASE_URL}/api/auth/register`, 
        registerData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      setRegistrationSuccess(true);
      
      // Redirect to login after delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMsg = "Une erreur est survenue lors de l'inscription";
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors from server
        const serverErrors = error.response.data.errors;
        errorMsg = Object.values(serverErrors)[0];
      }
      
      setErrors(prev => ({ ...prev, serverError: errorMsg }));
      
      // Scroll to error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordStrength = () => (
    <div className="password-strength">
      <div className="strength-bar">
        <div 
          className="strength-fill"
          style={{ width: `${passwordStrength}%` }}
          data-strength={passwordStrength}
        ></div>
      </div>
      <div className="strength-labels">
        <span>Faible</span>
        <span>Moyen</span>
        <span>Fort</span>
        <span>Très fort</span>
      </div>
    </div>
  );

  const PasswordRequirements = () => (
    <div className="password-requirements">
      <h6>Votre mot de passe doit contenir :</h6>
      <ul>
        <li className={formData.password.length >= 8 ? 'valid' : ''}>
          {formData.password.length >= 8 ? '✓' : '○'} Au moins 8 caractères
        </li>
        <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
          {/[A-Z]/.test(formData.password) ? '✓' : '○'} Une majuscule
        </li>
        <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
          {/[0-9]/.test(formData.password) ? '✓' : '○'} Un chiffre
        </li>
        <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'valid' : ''}>
          {/[^A-Za-z0-9]/.test(formData.password) ? '✓' : '○'} Un caractère spécial
        </li>
      </ul>
    </div>
  );

  const StepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="step-item">
          <div className={`step-circle ${step === stepNumber ? 'active' : step > stepNumber ? 'completed' : ''}`}>
            {step > stepNumber ? <CheckCircle size={16} /> : stepNumber}
          </div>
          <span className="step-label">
            {stepNumber === 1 && "Personnel"}
            {stepNumber === 2 && "Professionnel"}
            {stepNumber === 3 && "Finalisation"}
          </span>
          {stepNumber < 3 && <div className="step-line"></div>}
        </div>
      ))}
    </div>
  );

  const BenefitsSection = () => (
    <div className="benefits-section">
      <h4>Pourquoi rejoindre VABENE ?</h4>
      <div className="benefits-grid">
        <div className="benefit-card">
          <div className="benefit-icon">
            <TrendingUp size={24} />
          </div>
          <h5>Visibilité accrue</h5>
          <p>Augmentez votre portée auprès de milliers d'acheteurs et locataires</p>
        </div>
        <div className="benefit-card">
          <div className="benefit-icon">
            <BadgeCheck size={24} />
          </div>
          <h5>Profil vérifié</h5>
          <p>Gagnez la confiance des clients avec un profil certifié</p>
        </div>
        <div className="benefit-card">
          <div className="benefit-icon">
            <Users size={24} />
          </div>
          <h5>Outils puissants</h5>
          <p>Gérez vos annonces efficacement avec nos outils professionnels</p>
        </div>
        <div className="benefit-card">
          <div className="benefit-icon">
            <Target size={24} />
          </div>
          <h5>Support dédié</h5>
          <p>Bénéficiez d'un support client prioritaire et personnalisé</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="register-page">
      {/* Animated Background */}
      <div className="register-background">
        <div className="bg-shapes">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="bg-shape"
              style={{
                animationDelay: `${i * 0.5}s`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="register-header">
        <Link to="/" className="back-to-home">
          <Home size={20} />
          <span>Retour à l'accueil</span>
        </Link>
        <div className="brand-logo">
          <Building size={24} />
          <span>VABENE</span>
        </div>
      </header>

      <div className="register-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="register-wrapper"
        >
          {/* Left Panel - Benefits */}
          <div className="register-sidebar">
            <div className="sidebar-content">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="sidebar-header"
              >
                <h2>Rejoignez notre réseau de professionnels</h2>
                <p>Créez votre compte professionnel en quelques étapes simples</p>
              </motion.div>
              
              <BenefitsSection />
              
              <div className="testimonials">
                <h5>Ils nous font confiance</h5>
                <div className="testimonial">
                  <p>"Depuis que j'ai rejoint VABENE, mes ventes ont augmenté de 40%."</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">M</div>
                    <div className="author-info">
                      <strong>Mohamed Ben Ali</strong>
                      <span>Agence Horizon Immobilier</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="security-badge">
                <Shield size={20} />
                <span>Données sécurisées et chiffrées</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="register-form-container">
            <div className="form-header">
              <h1>Créer un compte professionnel</h1>
              <p>Complétez le formulaire ci-dessous pour commencer</p>
            </div>

            <StepIndicator />

            <AnimatePresence mode="wait">
              {registrationSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="success-screen"
                >
                  <div className="success-icon">
                    <CheckCircle size={64} />
                  </div>
                  <h2>Félicitations !</h2>
                  <p>Votre compte a été créé avec succès. Vous allez être redirigé vers votre tableau de bord.</p>
                  <div className="success-actions">
                    <Button variant="outline" onClick={() => navigate("/dashboard")}>
                      Accéder au dashboard
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key={`step-${step}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegister}
                  className="register-form"
                >
                  {/* Step 1: Personal Information */}
                  {step === 1 && (
                    <>
                      <h3>Informations personnelles</h3>
                      
                      <div className="form-group">
                        <label htmlFor="name">
                          <User size={18} />
                          <span>Nom complet</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={() => handleBlur('name')}
                          placeholder="Jean Dupont"
                          className={`modern-input ${errors.name && touched.name ? 'error' : ''}`}
                        />
                        {errors.name && touched.name && (
                          <div className="error-message">
                            <AlertCircle size={14} />
                            {errors.name}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="email">
                          <Mail size={18} />
                          <span>Email personnel</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={() => handleBlur('email')}
                          placeholder="jean.dupont@email.com"
                          className={`modern-input ${errors.email && touched.email ? 'error' : ''}`}
                        />
                        {errors.email && touched.email && (
                          <div className="error-message">
                            <AlertCircle size={14} />
                            {errors.email}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="password">
                          <Lock size={18} />
                          <span>Mot de passe</span>
                        </label>
                        <div className="password-input-wrapper">
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setShowPasswordRequirements(true)}
                            onBlur={() => {
                              handleBlur('password');
                              setTimeout(() => setShowPasswordRequirements(false), 200);
                            }}
                            placeholder="Créez un mot de passe sécurisé"
                            className={`modern-input ${errors.password && touched.password ? 'error' : ''}`}
                          />
                          <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        
                        <PasswordStrength />
                        
                        {showPasswordRequirements && (
                          <PasswordRequirements />
                        )}
                        
                        {errors.password && touched.password && (
                          <div className="error-message">
                            <AlertCircle size={14} />
                            {errors.password}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirmPassword">
                          <Lock size={18} />
                          <span>Confirmez le mot de passe</span>
                        </label>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={() => handleBlur('confirmPassword')}
                          placeholder="Retapez votre mot de passe"
                          className={`modern-input ${errors.confirmPassword && touched.confirmPassword ? 'error' : ''}`}
                        />
                        {errors.confirmPassword && touched.confirmPassword && (
                          <div className="error-message">
                            <AlertCircle size={14} />
                            {errors.confirmPassword}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Step 2: Professional Information */}
                  {step === 2 && (
                    <>
                      <h3>Informations professionnelles</h3>
                      
                      <div className="form-group">
                        <label htmlFor="companyName">
                          <Building size={18} />
                          <span>Nom de l'entreprise</span>
                        </label>
                        <input
                          id="companyName"
                          name="companyName"
                          type="text"
                          value={formData.companyName}
                          onChange={handleChange}
                          onBlur={() => handleBlur('companyName')}
                          placeholder="Immobilière Horizon"
                          className={`modern-input ${errors.companyName && touched.companyName ? 'error' : ''}`}
                        />
                        {errors.companyName && touched.companyName && (
                          <div className="error-message">
                            <AlertCircle size={14} />
                            {errors.companyName}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          <Building size={18} />
                          <span>Type d'activité</span>
                        </label>
                        <div className="business-type-grid">
                          {businessTypes.map((type) => (
                            <button
                              key={type.value}
                              type="button"
                              className={`business-type-card ${formData.businessType === type.value ? 'selected' : ''}`}
                              onClick={() => setFormData(prev => ({ ...prev, businessType: type.value }))}
                            >
                              <span className="type-icon">{type.icon}</span>
                              <span className="type-label">{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="professionalEmail">
                          <Mail size={18} />
                          <span>Email professionnel</span>
                        </label>
                        <input
                          id="professionalEmail"
                          name="professionalEmail"
                          type="email"
                          value={formData.professionalEmail}
                          onChange={handleChange}
                          onBlur={() => handleBlur('professionalEmail')}
                          placeholder="contact@votre-agence.com"
                          className={`modern-input ${errors.professionalEmail && touched.professionalEmail ? 'error' : ''}`}
                        />
                        {errors.professionalEmail && touched.professionalEmail && (
                          <div className="error-message">
                            <AlertCircle size={14} />
                            {errors.professionalEmail}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">
                          <Phone size={18} />
                          <span>Téléphone professionnel</span>
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={() => handleBlur('phone')}
                          placeholder="+33 1 23 45 67 89"
                          className={`modern-input ${errors.phone && touched.phone ? 'error' : ''}`}
                        />
                        {errors.phone && touched.phone && (
                          <div className="error-message">
                            <AlertCircle size={14} />
                            {errors.phone}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="address">
                          <MapPin size={18} />
                          <span>Adresse professionnelle</span>
                        </label>
                        <input
                          id="address"
                          name="address"
                          type="text"
                          value={formData.address}
                          onChange={handleChange}
                          onBlur={() => handleBlur('address')}
                          placeholder="123 Avenue des Champs-Élysées, 75008 Paris"
                          className={`modern-input ${errors.address && touched.address ? 'error' : ''}`}
                        />
                        {errors.address && touched.address && (
                          <div className="error-message">
                            <AlertCircle size={14} />
                            {errors.address}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="website">
                          <Globe size={18} />
                          <span>Site web (optionnel)</span>
                        </label>
                        <input
                          id="website"
                          name="website"
                          type="url"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://www.votre-agence.com"
                          className="modern-input"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="businessDescription">
                          <FileText size={18} />
                          <span>Description de l'activité (optionnel)</span>
                        </label>
                        <textarea
                          id="businessDescription"
                          name="businessDescription"
                          value={formData.businessDescription}
                          onChange={handleChange}
                          placeholder="Décrivez votre entreprise, vos spécialités, vos valeurs..."
                          rows={3}
                          className="modern-textarea"
                        />
                      </div>
                    </>
                  )}

                  {/* Step 3: Finalization */}
                  {step === 3 && (
                    <>
                      <h3>Finalisation de l'inscription</h3>
                      
                      <div className="review-section">
                        <h4>Récapitulatif</h4>
                        <div className="review-grid">
                          <div className="review-item">
                            <strong>Nom :</strong>
                            <span>{formData.name}</span>
                          </div>
                          <div className="review-item">
                            <strong>Email :</strong>
                            <span>{formData.email}</span>
                          </div>
                          <div className="review-item">
                            <strong>Entreprise :</strong>
                            <span>{formData.companyName}</span>
                          </div>
                          <div className="review-item">
                            <strong>Type :</strong>
                            <span>{formData.businessType}</span>
                          </div>
                          <div className="review-item">
                            <strong>Téléphone :</strong>
                            <span>{formData.phone}</span>
                          </div>
                          <div className="review-item">
                            <strong>Adresse :</strong>
                            <span>{formData.address}</span>
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <div className="checkbox-wrapper">
                          <input
                            type="checkbox"
                            id="termsAccepted"
                            name="termsAccepted"
                            checked={formData.termsAccepted}
                            onChange={handleChange}
                            className="modern-checkbox"
                          />
                          <label htmlFor="termsAccepted">
                            J'accepte les <a href="/terms" target="_blank" rel="noopener noreferrer">conditions d'utilisation</a> et la <a href="/privacy" target="_blank" rel="noopener noreferrer">politique de confidentialité</a>
                          </label>
                        </div>
                        {errors.termsAccepted && (
                          <div className="error-message">
                            <AlertCircle size={14} />
                            {errors.termsAccepted}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <div className="checkbox-wrapper">
                          <input
                            type="checkbox"
                            id="newsletter"
                            name="newsletter"
                            checked={formData.newsletter}
                            onChange={handleChange}
                            className="modern-checkbox"
                          />
                          <label htmlFor="newsletter">
                            Je souhaite recevoir des offres spéciales et des actualités par email
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Server Error */}
                  {errors.serverError && (
                    <div className="server-error">
                      <AlertCircle size={18} />
                      <span>{errors.serverError}</span>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="form-navigation">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="nav-button prev-button"
                      >
                        Précédent
                      </button>
                    )}
                    
                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="nav-button next-button"
                      >
                        Continuer
                        <ArrowRight size={18} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`nav-button submit-button ${isLoading ? 'loading' : ''}`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="spinner" size={20} />
                            <span>Inscription en cours...</span>
                          </>
                        ) : (
                          <>
                            <span>Finaliser l'inscription</span>
                            <CheckCircle size={18} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Already have account */}
            <div className="login-link">
              <p>Déjà un compte ?</p>
              <Link to="/login" className="login-button">
                Se connecter
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="register-footer">
        <div className="footer-links">
          <a href="/help">Aide</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Confidentialité</a>
          <a href="/terms">Conditions</a>
        </div>
        <p className="copyright">© 2024 VABENE Immobilier. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default Register;