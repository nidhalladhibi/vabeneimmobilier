import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/actions";
import { 
  Menu, X, Home, PlusCircle, User, LogOut, 
  LogIn, UserPlus, Search, Bell, Heart, 
  Settings, ChevronDown, Moon, Sun
} from "lucide-react";
import "../Navbar.css";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications] = useState(3); // Exemple de compteur

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
    setShowNotifications(false);
  }, [location]);

  // Fermer les menus au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target) && event.target.type !== 'search') {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode", !darkMode);
  };

  // Helper pour les URLs d'images
  const getImageUrl = (path) => {
    if (!path) return null;
    const API_BASE_URL =
      process.env.REACT_APP_API_URL || "http://localhost:5000";
    return path.startsWith('http') ? path : `${API_BASE_URL}/${path}`;
  };

  const menuItems = [
    { path: "/", label: "Accueil", icon: <Home size={20} /> },
    // { path: "/properties", label: "Propriétés", icon: <Home size={20} /> },
    { path: "/add-listing", label: "Ajouter", icon: <PlusCircle size={20} />, highlight: true },
    // { path: "/about", label: "À propos", icon: null },
    // { path: "/contact", label: "Contact", icon: null },
  ];

  const userMenuItems = user ? [
    // { path: "/profile", label: "Mon Profil", icon: <User size={18} /> },
    { path: "/my-properties", label: "Mes Annonces", icon: <Home size={18} /> },
    // { path: "/favorites", label: "Favoris", icon: <Heart size={18} /> },
    // { path: "/settings", label: "Paramètres", icon: <Settings size={18} /> },
    { type: "divider" },
    { label: "Déconnexion", icon: <LogOut size={18} />, onClick: handleLogout, danger: true }
  ] : [];

  const notificationItems = [
    { id: 1, text: "Nouveau message sur votre annonce", time: "5 min", read: false },
    { id: 2, text: "Votre annonce a été approuvée", time: "1h", read: false },
    { id: 3, text: "Nouveau visiteur sur votre profil", time: "2h", read: true },
    { id: 4, text: "Mise à jour des conditions", time: "1j", read: true },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""} ${darkMode ? "dark" : ""}`}>
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-brand">
            <Link to="/" className="logo">
              <div className="logo-icon-container">
                <Home className="logo-icon" size={28} />
                <div className="logo-glow"></div>
              </div>
              <span className="logo-text">
                VABENE
                <span className="logo-subtitle">Immobilier</span>
              </span>
            </Link>
          </div>

          {/* Navigation Desktop */}
          <div className="navbar-desktop">
            <div className="nav-links">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? "active" : ""} ${item.highlight ? "highlight" : ""}`}
                >
                  {item.icon && <span className="nav-link-icon">{item.icon}</span>}
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Barre de recherche */}
            <div className="navbar-search" ref={searchRef}>
              <form onSubmit={handleSearch} className={`search-form ${searchOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="search-toggle"
                  onClick={() => setSearchOpen(!searchOpen)}
                >
                  <Search size={20} />
                </button>
                <input
                  type="search"
                  className="search-input"
                  placeholder="Rechercher une propriété..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                />
                {searchOpen && (
                  <button type="submit" className="search-submit">
                    <Search size={20} />
                  </button>
                )}
              </form>
            </div>

            {/* Actions utilisateur */}
            <div className="navbar-actions">
              <button
                className="action-btn theme-toggle"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user ? (
                <>
                  {/* Notifications */}
                  <div className="notifications-container" ref={notificationsRef}>
                    <button
                      className="action-btn notifications-btn"
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <Bell size={20} />
                      {unreadNotifications > 0 && (
                        <span className="notification-badge">{unreadNotifications}</span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="notifications-dropdown">
                        <div className="notifications-header">
                          <h4>Notifications</h4>
                          <button className="mark-all-read">Tout marquer comme lu</button>
                        </div>
                        <div className="notifications-list">
                          {notificationItems.map((notification) => (
                            <div
                              key={notification.id}
                              className={`notification-item ${notification.read ? "read" : "unread"}`}
                            >
                              <div className="notification-content">
                                <p>{notification.text}</p>
                                <span className="notification-time">{notification.time}</span>
                              </div>
                              {!notification.read && <div className="notification-dot"></div>}
                            </div>
                          ))}
                        </div>
                        <Link to="/notifications" className="notifications-footer">
                          Voir toutes les notifications
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Menu utilisateur */}
                  <div className="user-menu-container" ref={userMenuRef}>
                    <button
                      className="user-menu-btn"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                    >
                      <div className="user-avatar">
                        {user.avatar ? (
                          <img src={getImageUrl(user.avatar)} alt={user.name} />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <span className="user-name">{user.name?.split(" ")[0] || "Profil"}</span>
                      <ChevronDown size={16} className={`dropdown-icon ${userMenuOpen ? "rotate" : ""}`} />
                    </button>

                    {userMenuOpen && (
                      <div className="user-menu-dropdown">
                        <div className="user-info">
                          <div className="user-avatar-large">
                            {user.avatar ? (
                              <img src={getImageUrl(user.avatar)} alt={user.name} />
                            ) : (
                              <User size={24} />
                            )}
                          </div>
                          <div className="user-details">
                            <h4>{user.name || "Utilisateur"}</h4>
                            <p>{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="user-menu-items">
                          {userMenuItems.map((item, index) => (
                            item.type === "divider" ? (
                              <div key={index} className="menu-divider" />
                            ) : (
                              <Link
                                key={index}
                                to={item.path || "#"}
                                className={`menu-item ${item.danger ? "danger" : ""}`}
                                onClick={(e) => {
                                  if (item.onClick) {
                                    e.preventDefault();
                                    item.onClick();
                                  }
                                  setUserMenuOpen(false);
                                }}
                              >
                                <span className="menu-item-icon">{item.icon}</span>
                                {item.label}
                              </Link>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn btn-outline">
                    <LogIn size={18} />
                    <span>Connexion</span>
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    <UserPlus size={18} />
                    <span>S'inscrire</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Menu mobile */}
          <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <div className={`burger ${mobileMenuOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu mobile overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)} />

      {/* Menu mobile panel */}
      <div className={`mobile-menu-panel ${mobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-menu-header">
          <div className="mobile-user-info">
            {user ? (
              <>
                <div className="mobile-user-avatar">
                  {user.avatar ? (
                    <img src={getImageUrl(user.avatar)} alt={user.name} />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div className="mobile-user-details">
                  <h4>{user.name || "Utilisateur"}</h4>
                  <p>{user.email}</p>
                </div>
              </>
            ) : (
              <div className="mobile-guest">
                <User size={40} />
                <p>Connectez-vous à votre compte</p>
              </div>
            )}
          </div>
          <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="mobile-menu-content">
          <form onSubmit={handleSearch} className="mobile-search">
            <Search size={20} />
            <input
              type="search"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="mobile-menu-items">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-menu-item ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            {user ? (
              <>
                <div className="mobile-menu-divider"></div>
                {userMenuItems
                  .filter(item => item.type !== "divider")
                  .map((item, index) => (
                    <Link
                      key={index}
                      to={item.path || "#"}
                      className={`mobile-menu-item ${item.danger ? "danger" : ""}`}
                      onClick={(e) => {
                        if (item.onClick) {
                          e.preventDefault();
                          item.onClick();
                        }
                        setMobileMenuOpen(false);
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
              </>
            ) : (
              <>
                <div className="mobile-menu-divider"></div>
                <Link
                  to="/login"
                  className="mobile-menu-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={20} />
                  <span>Connexion</span>
                </Link>
                <Link
                  to="/register"
                  className="mobile-menu-item highlight"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus size={20} />
                  <span>S'inscrire</span>
                </Link>
              </>
            )}
          </div>

          <div className="mobile-menu-footer">
            <button className="theme-toggle-mobile" onClick={toggleDarkMode}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span>{darkMode ? "Mode clair" : "Mode sombre"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
