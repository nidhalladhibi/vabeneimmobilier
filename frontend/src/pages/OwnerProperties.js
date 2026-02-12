import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Modal,
  Badge,
  Dropdown,
  Carousel,
} from "react-bootstrap";
import {
  Trash2,
  Edit,
  Eye,
  Calendar,
  MapPin,
  Home,
  DollarSign,
  Filter,
  Plus,
  MoreVertical,
  CheckCircle,
  Clock,
  BarChart3,
  Heart,
  Share2,
  Download,
  Copy,
  EyeOff,
  ArrowUpDown,
  Search,
  Users,
  TrendingUp,
  Star,
  Image as ImageIcon,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Cookies from "js-cookie"; // ✅ IMPORT JS-COOKIE
import "../OwnerProperties.css";

const OwnerProperties = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    views: 0
  });
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const filters = [
    { id: "all", label: "Toutes", count: 0 },
    { id: "active", label: "Actives", count: 0 },
    { id: "pending", label: "En attente", count: 0 },
    { id: "sold", label: "Vendues", count: 0 },
    { id: "rented", label: "Louées", count: 0 },
  ];

  const sortOptions = [
    { id: "newest", label: "Plus récentes", icon: Calendar },
    { id: "oldest", label: "Plus anciennes", icon: Calendar },
    { id: "price-high", label: "Prix décroissant", icon: DollarSign },
    { id: "price-low", label: "Prix croissant", icon: DollarSign },
    { id: "views", label: "Plus vues", icon: Eye },
    { id: "title", label: "Titre A-Z", icon: ArrowUpDown },
  ];

  // ✅ FETCH LISTINGS CORRIGÉ AVEC COOKIES
  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = Cookies.get("token"); // ✅ Lire token depuis cookie

      if (!token) {
        navigate("/login");
        return;
      }

      const { data } = await axios.get(
        `${API_BASE_URL}/api/properties/owner`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setListings(data || []);
      setFilteredListings(data || []);

      // Calculate statistics
      const activeCount = data?.filter(l => l.status === 'active').length || 0;
      const pendingCount = data?.filter(l => l.status === 'pending').length || 0;
      const soldCount = data?.filter(l => l.status === 'sold').length || 0;
      const rentedCount = data?.filter(l => l.status === 'rented').length || 0;
      const totalViews = data?.reduce((sum, l) => sum + (l.views || 0), 0) || 0;

      setStats({
        total: data?.length || 0,
        active: activeCount,
        pending: pendingCount,
        views: totalViews
      });

      // Update filter counts
      filters[0].count = data?.length || 0;
      filters[1].count = activeCount;
      filters[2].count = pendingCount;
      filters[3].count = soldCount;
      filters[4].count = rentedCount;

    } catch (error) {
      console.error("Erreur de chargement des annonces", error);
      if (error.response?.status === 401) {
        Cookies.remove("token"); // ✅ Nettoyer cookie invalide
        Cookies.remove("user");
        navigate("/login");
      } else {
        setError("Impossible de charger vos annonces. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, navigate]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Filter and sort listings
  useEffect(() => {
    let results = [...listings];

    if (searchTerm) {
      results = results.filter(listing =>
        listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeFilter !== "all") {
      results = results.filter(listing => listing.status === activeFilter);
    }

    switch (sortBy) {
      case "newest":
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "price-high":
        results.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "price-low":
        results.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "views":
        results.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "title":
        results.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      default:
        break;
    }

    setFilteredListings(results);
  }, [listings, activeFilter, searchTerm, sortBy]);

  // ✅ DELETE CORRIGÉ AVEC COOKIES
  const onDelete = async () => {
    if (!selectedListing) return;

    try {
      const token = Cookies.get("token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.delete(
        `${API_BASE_URL}/api/properties/${selectedListing._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchListings();
      setShowDeleteModal(false);
      setSelectedListing(null);
    } catch (error) {
      console.error("Erreur lors de la suppression", error);
      setError("Impossible de supprimer l'annonce. Veuillez réessayer.");
    }
  };

  // ✅ STATUS CHANGE CORRIGÉ AVEC COOKIES
  const handleStatusChange = async (listingId, newStatus) => {
    try {
      const token = Cookies.get("token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.patch(
        `${API_BASE_URL}/api/properties/${listingId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchListings();
    } catch (error) {
      console.error("Erreur lors du changement de statut", error);
      setError("Impossible de modifier le statut. Veuillez réessayer.");
    }
  };

  const onEdit = (id) => {
    navigate(`/edit-property/${id}`);
  };

  const onView = (id) => {
    navigate(`/property/${id}`);
  };

  const confirmDelete = (listing) => {
    setSelectedListing(listing);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { variant: 'success', label: 'Active', icon: CheckCircle };
      case 'pending':
        return { variant: 'warning', label: 'En attente', icon: Clock };
      case 'sold':
        return { variant: 'danger', label: 'Vendue', icon: CheckCircle };
      case 'rented':
        return { variant: 'info', label: 'Louée', icon: CheckCircle };
      default:
        return { variant: 'secondary', label: 'Inactive', icon: EyeOff };
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      variants={itemVariants}
      className="stats-card"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="stats-content">
        <div className="stats-icon" style={{ background: `${color}20`, color }}>
          <Icon size={20} />
        </div>
        <div className="stats-text">
          <h3>{value.toLocaleString()}</h3>
          <p>{title}</p>
        </div>
      </div>
    </motion.div>
  );

  const PropertyCard = ({ listing }) => {
    const status = getStatusBadge(listing.status);
    const StatusIcon = status.icon;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleImageError = (e) => {
      e.target.onerror = null;
      e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
    };

    const nextImage = () => {
      setCurrentImageIndex((prev) =>
        prev === (listing.images?.length - 1 || 0) ? 0 : prev + 1
      );
    };

    const prevImage = () => {
      setCurrentImageIndex((prev) =>
        prev === 0 ? (listing.images?.length - 1 || 0) : prev - 1
      );
    };

    return (
      <motion.div variants={itemVariants}>
        <Card className="property-card shadow-sm border-0 h-100">
          <div className="property-image-container position-relative">
            {listing.images && listing.images.length > 0 ? (
              <>
                <Carousel
                  activeIndex={currentImageIndex}
                  onSelect={setCurrentImageIndex}
                  interval={null}
                  indicators={listing.images.length > 1}
                  controls={listing.images.length > 1}
                  prevIcon={<ChevronLeft size={24} color="white" />}
                  nextIcon={<ChevronRight size={24} color="white" />}
                >
                  {listing.images.map((image, index) => {
                    const imageUrl = image.startsWith('http')
                      ? image
                      : `${API_BASE_URL}/${image}`;

                    return (
                      <Carousel.Item key={index}>
                        <div className="property-image-wrapper">
                          <img
                            src={imageUrl}
                            alt={`${listing.title || 'Propriété'} - image ${index + 1}`}
                            className="property-image"
                            onError={handleImageError}
                            loading="lazy"
                          />
                          {listing.images.length > 1 && (
                            <div className="image-counter">
                              {index + 1}/{listing.images.length}
                            </div>
                          )}
                        </div>
                      </Carousel.Item>
                    );
                  })}
                </Carousel>

                {listing.images.length > 1 && (
                  <div className="image-nav-buttons">
                    <button
                      className="nav-btn prev-btn"
                      onClick={prevImage}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      className="nav-btn next-btn"
                      onClick={nextImage}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="property-image-placeholder">
                <ImageIcon size={48} className="placeholder-icon" />
                <span>Aucune photo</span>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mt-2"
                  onClick={() => onEdit(listing._id)}
                >
                  <Plus size={14} className="me-1" />
                  Ajouter des photos
                </Button>
              </div>
            )}

            <Badge
              bg={status.variant}
              className="property-status position-absolute top-0 start-0 m-3"
            >
              <StatusIcon size={12} className="me-1" />
              {status.label}
            </Badge>

            <div className="property-actions-overlay">
              <Button
                variant="light"
                size="sm"
                onClick={() => onView(listing._id)}
                className="action-btn"
                title="Voir l'annonce"
              >
                <Eye size={16} />
              </Button>
              <Button
                variant="light"
                size="sm"
                onClick={() => navigate(`/property/${listing._id}/stats`)}
                className="action-btn"
                title="Statistiques"
              >
                <BarChart3 size={16} />
              </Button>
              <Button
                variant="light"
                size="sm"
                onClick={() => { }}
                className="action-btn"
                title="Partager"
              >
                <Share2 size={16} />
              </Button>
              <Button
                variant="light"
                size="sm"
                onClick={() => { }}
                className="action-btn"
                title="Agrandir"
              >
                <Maximize2 size={16} />
              </Button>
            </div>

            <div className="property-stats position-absolute bottom-0 start-0 w-100">
              <div className="d-flex justify-content-between px-3 py-2">
                <span className="stat-item">
                  <Eye size={12} className="me-1" />
                  {listing.views || 0}
                </span>
                <span className="stat-item">
                  <Heart size={12} className="me-1" />
                  {listing.likes || 0}
                </span>
                <span className="stat-item">
                  <Calendar size={12} className="me-1" />
                  {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <Card.Body className="property-body d-flex flex-column">
            <div className="property-header d-flex justify-content-between align-items-start mb-3">
              <div className="flex-grow-1 me-2">
                <Card.Title className="property-title mb-1">
                  {listing.title || 'Sans titre'}
                </Card.Title>
                <div className="property-price text-primary fw-bold fs-5 mb-2">
                  {listing.price ? `${listing.price.toLocaleString()} DT` : 'Prix non spécifié'}
                  {listing.category === 'location' && <span className="text-muted small">/mois</span>}
                </div>
              </div>

              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="link"
                  className="property-more p-0 border-0"
                  style={{ boxShadow: 'none' }}
                >
                  <MoreVertical size={20} />
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow-lg">
                  <Dropdown.Item onClick={() => onEdit(listing._id)}>
                    <Edit size={16} className="me-2 text-primary" />
                    <span>Modifier</span>
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => onView(listing._id)}>
                    <Eye size={16} className="me-2 text-info" />
                    <span>Voir l'annonce</span>
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => { }}>
                    <Copy size={16} className="me-2 text-warning" />
                    <span>Dupliquer</span>
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => { }}>
                    <Download size={16} className="me-2 text-secondary" />
                    <span>Télécharger PDF</span>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={() => confirmDelete(listing)}
                    className="text-danger"
                  >
                    <Trash2 size={16} className="me-2" />
                    <span>Supprimer</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            <Card.Text className="property-description text-muted mb-3 flex-grow-1">
              {listing.description ?
                listing.description.length > 120
                  ? `${listing.description.substring(0, 120)}...`
                  : listing.description
                : 'Aucune description disponible'
              }
            </Card.Text>

            <div className="property-details mb-3">
              <div className="row g-2">
                <div className="col-6">
                  <div className="detail-item">
                    <MapPin size={16} className="detail-icon text-primary" />
                    <div>
                      <div className="detail-label small text-muted">Localisation</div>
                      <div className="detail-value small">
                        {listing.location || 'Non spécifiée'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="detail-item">
                    <Home size={16} className="detail-icon text-primary" />
                    <div>
                      <div className="detail-label small text-muted">Surface</div>
                      <div className="detail-value small">
                        {listing.bedrooms || 0} ch • {listing.bathrooms || 0} sdb
                        {listing.area && ` • ${listing.area} m²`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="status-actions mt-auto pt-3 border-top">
              <div className="d-flex flex-wrap gap-2">
                {listing.status === 'active' && (
                  <>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleStatusChange(listing._id, 'sold')}
                      className="flex-grow-1"
                    >
                      <CheckCircle size={14} className="me-1" />
                      Vendue
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleStatusChange(listing._id, 'rented')}
                      className="flex-grow-1"
                    >
                      <CheckCircle size={14} className="me-1" />
                      Louée
                    </Button>
                  </>
                )}

                {listing.status === 'pending' && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleStatusChange(listing._id, 'active')}
                    className="flex-grow-1"
                  >
                    <CheckCircle size={14} className="me-1" />
                    Activer
                  </Button>
                )}

                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => onEdit(listing._id)}
                  className="flex-grow-1"
                >
                  <Edit size={14} className="me-1" />
                  Modifier
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="owner-properties-page">
      {/* Header */}
      <div className="page-header py-5 bg-gradient-primary text-white">
        <Container>
          <div className="header-content d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="header-text mb-4 mb-md-0"
            >
              <h1 className="display-5 fw-bold mb-2">Mes annonces</h1>
              <p className="lead opacity-90 mb-0">
                Gérez et suivez toutes vos propriétés en un seul endroit
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="header-actions"
            >
              <Button
                variant="light"
                onClick={() => navigate("/add-listing")}
                className="add-button px-4 py-3 fw-semibold"
                size="lg"
              >
                <Plus size={20} className="me-2" />
                Ajouter une annonce
              </Button>
            </motion.div>
          </div>
        </Container>
      </div>

      <Container className="my-5">
        {/* Stats Overview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-5"
        >
          <Row className="g-4">
            <Col md={3} sm={6}>
              <StatsCard
                title="Total annonces"
                value={stats.total}
                icon={Home}
                color="#3b82f6"
              />
            </Col>
            <Col md={3} sm={6}>
              <StatsCard
                title="Actives"
                value={stats.active}
                icon={CheckCircle}
                color="#10b981"
              />
            </Col>
            <Col md={3} sm={6}>
              <StatsCard
                title="En attente"
                value={stats.pending}
                icon={Clock}
                color="#f59e0b"
              />
            </Col>
            <Col md={3} sm={6}>
              <StatsCard
                title="Vues totales"
                value={stats.views}
                icon={Eye}
                color="#8b5cf6"
              />
            </Col>
          </Row>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-5"
        >
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                {/* Search */}
                <Col lg={4} md={6} className="mb-3 mb-md-0">
                  <div className="search-box position-relative">
                    <Search size={20} className="search-icon position-absolute top-50 start-3 translate-middle-y" />
                    <input
                      type="text"
                      placeholder="Rechercher une annonce..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-control ps-5"
                    />
                    {searchTerm && (
                      <button
                        className="btn btn-link position-absolute top-50 end-3 translate-middle-y p-0"
                        onClick={() => setSearchTerm("")}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </Col>

                {/* Status Filters */}
                <Col lg={5} md={6} className="mb-3 mb-md-0">
                  <div className="status-filters">
                    <div className="filter-label d-flex align-items-center gap-2 mb-2">
                      <Filter size={18} />
                      <span className="fw-medium">Filtrer par :</span>
                    </div>
                    <div className="filter-buttons d-flex flex-wrap gap-2">
                      {filters.map((filter) => (
                        <button
                          key={filter.id}
                          className={`btn btn-sm ${activeFilter === filter.id ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setActiveFilter(filter.id)}
                        >
                          {filter.label}
                          {filter.count > 0 && (
                            <span className="badge bg-white text-primary ms-2">
                              {filter.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </Col>

                {/* Sort Options */}
                <Col lg={3}>
                  <div className="sort-dropdown">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="form-select"
                    >
                      <option value="" disabled>Trier par</option>
                      {sortOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3">Chargement de vos annonces...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredListings.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="empty-state-wrapper"
              >
                <div className="empty-state-content text-center py-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="empty-icon-container mb-4"
                  >
                    <div className="empty-icon bg-light rounded-circle p-4 d-inline-flex">
                      <Home size={48} className="text-primary" />
                    </div>
                  </motion.div>

                  <h3 className="mb-3">
                    {searchTerm || activeFilter !== "all"
                      ? "Aucune propriété ne correspond"
                      : "Commencez votre collection"}
                  </h3>

                  <p className="text-muted mb-4 lead">
                    {searchTerm || activeFilter !== "all"
                      ? "Essayez d'ajuster vos critères de recherche ou explorez d'autres options."
                      : "Ajoutez votre première annonce et commencez à attirer des acheteurs dès aujourd'hui."}
                  </p>

                  <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                    {searchTerm || activeFilter !== "all" ? (
                      <Button
                        variant="outline-primary"
                        onClick={() => {
                          setSearchTerm("");
                          setActiveFilter("all");
                        }}
                        className="px-4"
                        size="lg"
                      >
                        Réinitialiser les filtres
                      </Button>
                    ) : null}
                    <Button
                      variant="primary"
                      onClick={() => navigate("/add-listing")}
                      className="px-4"
                      size="lg"
                    >
                      <Plus size={20} className="me-2" />
                      Ajouter une annonce
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="listings"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h3 className="mb-1">
                      <span className="fw-bold text-primary">{filteredListings.length}</span>
                      <span className="text-muted ms-2">
                        propriété{filteredListings.length > 1 ? 's' : ''} trouvée{filteredListings.length > 1 ? 's' : ''}
                      </span>
                    </h3>
                    <p className="text-muted small mb-0">
                      Découvrez et gérez vos propriétés
                    </p>
                  </div>
                </div>

                <Row xs={1} md={2} lg={3} className="g-4">
                  {filteredListings.map((listing, index) => (
                    <Col key={listing._id || index}>
                      <PropertyCard listing={listing} />
                    </Col>
                  ))}
                </Row>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        size="md"
      >
        <Modal.Body className="p-5 text-center">
          <div className="mb-4">
            <div className="delete-icon bg-danger bg-opacity-10 rounded-circle p-4 d-inline-flex">
              <Trash2 size={48} className="text-danger" />
            </div>
          </div>
          <h4 className="mb-3">Supprimer l'annonce</h4>
          <p className="text-muted mb-4">
            Êtes-vous sûr de vouloir supprimer "<strong>{selectedListing?.title}</strong>" ?
            Cette action est irréversible.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Button
              variant="outline-secondary"
              onClick={() => setShowDeleteModal(false)}
              className="px-4"
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={onDelete}
              className="px-4"
            >
              Supprimer définitivement
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OwnerProperties;