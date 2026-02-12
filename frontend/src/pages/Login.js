import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { login } from "../store/actions";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  Home,
  Shield,
  Smartphone,
  Globe
} from "lucide-react";
import "../Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    facebook: false,
    github: false,
  });
  const [formStep] = useState(1);
  const [showSecurityTips, setShowSecurityTips] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Check for saved credentials
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }

    // Show security tips on first visit
    const hasVisited = localStorage.getItem("hasVisitedLogin");
    if (!hasVisited) {
      setTimeout(() => {
        setShowSecurityTips(true);
        localStorage.setItem("hasVisitedLogin", "true");
      }, 2000);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    const { email, password } = formData;

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Veuillez entrer une adresse email valide.");
      return false;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000,
        }
      );

      // Store credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      dispatch(login(data));

      // Store authentication data
      Cookies.set("user", JSON.stringify(data.user), { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict', 
        path: '/' 
      });
      Cookies.set("token", data.token, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict', 
        path: '/' 
      });

      // Store session data
      sessionStorage.setItem("auth_token", data.token);
      sessionStorage.setItem("user_data", JSON.stringify(data.user));

      setSuccess("Connexion réussie ! Redirection en cours...");

      // Animation before redirect
      setTimeout(() => {
        if (data.user.role === 'admin') {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      }, 1500);

    } catch (error) {
      console.error("Erreur de connexion :", error);

      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Erreur de connexion. Veuillez réessayer.";

      setError(errorMessage);

      // Specific error handling
      if (error.response?.status === 401) {
        setError("Email ou mot de passe incorrect.");
      } else if (error.response?.status === 403) {
        setError("Votre compte est en attente d'approbation par un administrateur.");
      } else if (error.response?.status === 429) {
        setError("Trop de tentatives. Veuillez réessayer plus tard.");
      } else if (!navigator.onLine) {
        setError("Pas de connexion internet. Veuillez vérifier votre connexion.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setSocialLoading(prev => ({ ...prev, [provider]: true }));
    setError("");
    setSuccess("");

    try {
      // In a real app, you would redirect to the OAuth provider
      // For now, we'll simulate the process
      const providers = {
        google: `${API_BASE_URL}/api/auth/google`,
        facebook: `${API_BASE_URL}/api/auth/facebook`,
        github: `${API_BASE_URL}/api/auth/github`,
      };

      // Open new window for OAuth
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        providers[provider],
        `${provider}Login`,
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for message from popup
      const handleMessage = (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'oauth-success') {
          const userData = event.data.user;
          dispatch(login(userData));
          
          Cookies.set("user", JSON.stringify(userData.user), { 
            expires: 7, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict', 
            path: '/' 
          });
          Cookies.set("token", userData.token, { 
            expires: 7, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict', 
            path: '/' 
          });

          setSuccess(`Connexion réussie avec ${provider}!`);
          
          setTimeout(() => {
            if (userData.user.role === 'admin') {
              navigate("/dashboard");
            } else {
              navigate("/");
            }
          }, 1500);
          
          popup.close();
          window.removeEventListener('message', handleMessage);
        }
        
        if (event.data.type === 'oauth-error') {
          setError(`Erreur lors de la connexion avec ${provider}`);
          popup.close();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

    } catch (error) {
      console.error(`Erreur de connexion avec ${provider}:`, error);
      setError(`Impossible de se connecter avec ${provider}. Veuillez réessayer.`);
    } finally {
      setSocialLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  const SecurityTips = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="security-tips"
    >
      <div className="security-tips-header">
        <Shield size={20} />
        <h4>Conseils de sécurité</h4>
        <button 
          className="close-tips"
          onClick={() => setShowSecurityTips(false)}
        >
          ×
        </button>
      </div>
      <ul>
        <li>Ne partagez jamais vos identifiants</li>
        <li>Utilisez un mot de passe unique et fort</li>
        <li>Activez l'authentification à deux facteurs</li>
        <li>Vérifiez toujours l'URL du site</li>
      </ul>
    </motion.div>
  );

  const socialProviders = [
    {
      name: "google",
      label: "Google",
      icon: "G",
      color: "#DB4437",
      textColor: "#fff",
    },
    {
      name: "facebook",
      label: "Facebook",
      icon: "f",
      color: "#4267B2",
      textColor: "#fff",
    },
    {
      name: "github",
      label: "GitHub",
      icon: "G",
      color: "#333",
      textColor: "#fff",
    },
  ];

  return (
    <div className="login-page">
      {/* Animated Background */}
      <div className="animated-background">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="floating-shape" style={{
            animationDelay: `${i * 0.5}s`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
          }} />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="decorative-elements">
        <div className="decorative-circle circle-1"></div>
        <div className="decorative-circle circle-2"></div>
        <div className="decorative-circle circle-3"></div>
        <div className="decorative-line line-1"></div>
        <div className="decorative-line line-2"></div>
      </div>

      {/* Header */}
      <header className="login-header">
        <Link to="/" className="back-home">
          <Home size={20} />
          <span>Retour à l'accueil</span>
        </Link>
      </header>

      <div className="login-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="login-wrapper"
        >
          {/* Left Panel - Branding */}
          <div className="login-branding">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="brand-logo"
            >
              <div className="logo-outer">
                <div className="logo-inner">
                  <Globe size={32} />
                </div>
                <div className="logo-glow"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="brand-content"
            >
              <h1>Bienvenue sur VABENE</h1>
              <p>Connectez-vous pour accéder à votre espace personnel et gérer vos propriétés.</p>
              
              <div className="features-list">
                <div className="feature-item">
                  <CheckCircle size={18} />
                  <span>Gérez vos annonces</span>
                </div>
                <div className="feature-item">
                  <CheckCircle size={18} />
                  <span>Suivez vos favoris</span>
                </div>
                <div className="feature-item">
                  <CheckCircle size={18} />
                  <span>Recevez des notifications</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="login-form-container"
          >
            <div className="form-header">
              <h2>Connexion</h2>
              <p>Accédez à votre compte</p>
            </div>

            {/* Progress Steps */}
            <div className="form-progress">
              <div className={`step ${formStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <span>Identifiants</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${formStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <span>Sécurité</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="form-group"
              >
                <label htmlFor="email">
                  <Mail size={18} />
                  <span>Adresse email</span>
                </label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="exemple@email.com"
                    className={`modern-input ${formData.email ? 'has-value' : ''}`}
                    autoComplete="email"
                  />
                  {formData.email && (
                    <button
                      type="button"
                      className="clear-input"
                      onClick={() => setFormData(prev => ({ ...prev, email: "" }))}
                    >
                      ×
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="form-group"
              >
                <label htmlFor="password">
                  <Lock size={18} />
                  <span>Mot de passe</span>
                </label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Votre mot de passe"
                    className={`modern-input ${formData.password ? 'has-value' : ''}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="form-options"
              >
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="rememberMe">Se souvenir de moi</label>
                </div>
                <Link to="/forgot-password" className="forgot-password">
                  Mot de passe oublié ?
                </Link>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="error-message"
                  >
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="success-message"
                  >
                    <CheckCircle size={18} />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className={`submit-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Se connecter</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="divider">
                <span>OU</span>
              </div>

              {/* Social Login */}
              <div className="social-login">
                {socialProviders.map((provider) => (
                  <motion.button
                    key={provider.name}
                    type="button"
                    className="social-button"
                    onClick={() => handleSocialLogin(provider.name)}
                    disabled={socialLoading[provider.name]}
                    style={{
                      backgroundColor: provider.color,
                      color: provider.textColor,
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: `0 10px 20px ${provider.color}40`
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {socialLoading[provider.name] ? (
                      <Loader2 className="spinner" size={18} />
                    ) : (
                      <>
                        <span className="social-icon">{provider.icon}</span>
                        <span>Continuer avec {provider.label}</span>
                      </>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Mobile Login Option */}
              <div className="mobile-login-option">
                <Smartphone size={18} />
                <span>Vous pouvez aussi vous connecter avec votre téléphone</span>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="signup-link">
              <p>Pas encore de compte ?</p>
              <Link to="/register" className="signup-button">
                Créer un compte gratuit
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Security Tips */}
            <AnimatePresence>
              {showSecurityTips && <SecurityTips />}
            </AnimatePresence>

            {/* Legal Links */}
            <div className="legal-links">
              <Link to="/privacy">Politique de confidentialité</Link>
              <Link to="/terms">Conditions d'utilisation</Link>
              <Link to="/help">Aide</Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Language Selector */}
      <div className="language-selector">
        <select>
          <option value="fr">🇫🇷 Français</option>
          <option value="en">🇬🇧 English</option>
          <option value="ar">🇹🇳 العربية</option>
        </select>
      </div>
    </div>
  );
};

export default Login;