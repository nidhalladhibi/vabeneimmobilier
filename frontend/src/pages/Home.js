import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, Row, Col, Spinner, Carousel, Card, 
  Button, Form, InputGroup, Badge 
} from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'animate.css/animate.min.css';
import { motion } from 'framer-motion';
import '../Home.css';

// Icône personnalisée pour les marqueurs
const createCustomIcon = (price) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container">
        <div class="marker-pulse"></div>
        <div class="marker-price">${price}DT</div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 50]
  });
};

// Composant ListingCard corrigé
const ListingCard = ({ listing, API_BASE_URL, navigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -5 }}
    className="listing-card-wrapper"
  >
    <Card className="listing-card shadow-sm border-0 h-100">
      <div className="position-relative listing-card-image-container">
        {listing.images && listing.images.length > 0 && listing.images[0] ? (
          <Carousel interval={null} indicators={listing.images.length > 1} controls={listing.images.length > 1}>
            {listing.images.map((image, index) => {
              const imageUrl = image.startsWith('http') ? image : `${API_BASE_URL}/${image}`;
              return (
                <Carousel.Item key={index}>
                  <img
                    src={imageUrl}
                    alt={`${listing.title} - Image ${index + 1}`}
                    className="d-block w-100 listing-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                </Carousel.Item>
              );
            })}
          </Carousel>
        ) : (
          <div className="listing-image-placeholder">
            <i className="bi bi-image fs-1"></i>
            <span className="mt-2">Aucune photo</span>
          </div>
        )}
        <Badge bg={listing.category === 'vente' ? 'success' : 'info'} className="position-absolute top-0 start-0 m-2">
          {listing.category === 'vente' ? 'À Vendre' : 'À Louer'}
        </Badge>
        {listing.type && (
          <Badge bg="dark" className="position-absolute top-0 end-0 m-2">
            {listing.type}
          </Badge>
        )}
      </div>
      
      <Card.Body className="d-flex flex-column">
        <Card.Title className="listing-title mb-2">{listing.title}</Card.Title>
        
        {listing.description && (
          <p className="listing-description text-muted small mb-3">
            {listing.description.length > 100 
              ? `${listing.description.substring(0, 100)}...` 
              : listing.description}
          </p>
        )}
        
        <div className="listing-details mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-primary fw-bold fs-4">{listing.price ? `${listing.price}DT` : 'Prix non spécifié'}</span>
            <span className="text-muted">
              <i className="bi bi-geo-alt me-1"></i>
              {listing.location || 'Localisation non spécifiée'}
            </span>
          </div>
          
          <div className="listing-features mb-3">
            {listing.bedrooms && listing.bedrooms > 0 && (
              <span className="me-3">
                <i className="bi bi-door-closed me-1"></i>
                {listing.bedrooms} ch
              </span>
            )}
            {listing.bathrooms && listing.bathrooms > 0 && (
              <span className="me-3">
                <i className="bi bi-bath me-1"></i>
                {listing.bathrooms} sdb
              </span>
            )}
            {listing.area && (
              <span>
                <i className="bi bi-arrows-angle-expand me-1"></i>
                {listing.area} m²
              </span>
            )}
          </div>
          
          <div className="listing-date text-muted small mb-3">
            <i className="bi bi-clock me-1"></i>
            {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
          </div>
          
          <Button 
            variant="primary" 
            className="w-100"
            onClick={() => navigate(`/property/${listing._id}`)}
          >
            <i className="bi bi-eye me-2"></i>
            Voir les détails
          </Button>
        </div>
      </Card.Body>
    </Card>
  </motion.div>
);

const Home = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([36.8065, 10.1815]);
  const [mapZoom, setMapZoom] = useState(7);
  const [mapProperties, setMapProperties] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    forSale: 0,
    forRent: 0,
    averagePrice: 0
  });
  
  const mapRef = useRef(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/api/properties`);
        
        // Debug: Vérifier les données reçues
        console.log('Données reçues:', data);
        if (data && data.length > 0) {
          console.log('Première annonce:', data[0]);
          console.log('Images de la première annonce:', data[0].images);
        }
        
        setListings(data || []);
        setFilteredListings(data || []);

        // Extraire les localisations uniques
        const uniqueLocations = [...new Set(data.map(item => item.location).filter(Boolean))];
        setLocations(uniqueLocations);

        // Extraire les types de propriétés
        const uniqueTypes = [...new Set(data.map(item => item.type).filter(Boolean))];
        setPropertyTypes(uniqueTypes);

        // Calculer les statistiques
        const forSale = data.filter(item => item.category === 'vente').length;
        const forRent = data.filter(item => item.category === 'location').length;
        const averagePrice = data.length > 0 
          ? Math.round(data.reduce((sum, item) => sum + (item.price || 0), 0) / data.length)
          : 0;

        setStats({
          total: data.length,
          forSale,
          forRent,
          averagePrice
        });

        // Préparer les propriétés pour la carte
        const tunisianCities = {
          "Tunis": [36.8065, 10.1815],
          "Sousse": [35.8245, 10.6346],
          "Sfax": [34.7406, 10.7603],
          "Hammamet": [36.3999, 10.6143],
          "Djerba": [33.8075, 10.8451],
          "Monastir": [35.7643, 10.8113],
          "Bizerte": [37.2746, 9.8627],
          "Nabeul": [36.4513, 10.7357]
        };
        
        const propertiesWithCoordinates = (data || []).map(property => {
          if (property.latitude && property.longitude) {
            return property;
          }
          
          const loc = property.location;
          if (loc && tunisianCities[loc]) {
            return {
              ...property,
              latitude: tunisianCities[loc][0],
              longitude: tunisianCities[loc][1]
            };
          }
          
          return {
            ...property,
            latitude: 36.8065,
            longitude: 10.1815
          };
        });
        
        setMapProperties(propertiesWithCoordinates);
        setLoading(false);
        
      } catch (error) {
        console.error("Erreur de chargement des annonces", error);
        setListings([]);
        setFilteredListings([]);
        setLoading(false);
      }
    };
    
    fetchListings();
  }, [API_BASE_URL]);

  useEffect(() => {
    filterListings();
  }, [searchTerm, minPrice, maxPrice, location, propertyType, listings]);

  const filterListings = () => {
    let results = [...listings];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(listing => {
        const title = listing.title?.toLowerCase() || '';
        const description = listing.description?.toLowerCase() || '';
        const loc = listing.location?.toLowerCase() || '';
        return title.includes(term) || description.includes(term) || loc.includes(term);
      });
    }

    if (minPrice) {
      const min = parseInt(minPrice);
      if (!isNaN(min)) {
        results = results.filter(listing => listing.price >= min);
      }
    }

    if (maxPrice) {
      const max = parseInt(maxPrice);
      if (!isNaN(max)) {
        results = results.filter(listing => listing.price <= max);
      }
    }

    if (location) {
      results = results.filter(listing => listing.location === location);
    }

    if (propertyType) {
      results = results.filter(listing => listing.type === propertyType);
    }

    setFilteredListings(results);
    
    // Mettre à jour les propriétés sur la carte
    const tunisianCities = {
      "Tunis": [36.8065, 10.1815],
      "Sousse": [35.8245, 10.6346],
      "Sfax": [34.7406, 10.7603],
      "Hammamet": [36.3999, 10.6143],
      "Djerba": [33.8075, 10.8451],
      "Monastir": [35.7643, 10.8113],
      "Bizerte": [37.2746, 9.8627],
      "Nabeul": [36.4513, 10.7357]
    };
    
    const filteredMapProperties = results.map(property => {
      if (property.latitude && property.longitude) {
        return property;
      }
      
      const loc = property.location;
      if (loc && tunisianCities[loc]) {
        return {
          ...property,
          latitude: tunisianCities[loc][0],
          longitude: tunisianCities[loc][1]
        };
      }
      
      return {
        ...property,
        latitude: 36.8065,
        longitude: 10.1815
      };
    });
    
    setMapProperties(filteredMapProperties);
    
    if (location && tunisianCities[location]) {
      setMapCenter(tunisianCities[location]);
      setMapZoom(12);
    } else {
      setMapCenter([36.8065, 10.1815]);
      setMapZoom(7);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setLocation("");
    setPropertyType("");
    setFilteredListings(listings);
    setMapCenter([36.8065, 10.1815]);
    setMapZoom(7);
  };

  const toggleMapView = () => {
    setShowMap(!showMap);
  };

  const carouselItems = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: "Votre Maison de Rêve Vous Attend",
      description: "Découvrez des propriétés exclusives dans toute la Tunisie"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: "Investissez dans Votre Avenir",
      description: "Des opportunités immobilières uniques à ne pas manquer"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: "Vivre avec Élégance",
      description: "Des espaces conçus pour votre confort et bien-être"
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section avec Carousel */}
      <section className="hero-section">
        <Carousel fade controls={false} indicators className="hero-carousel">
          {carouselItems.map((item) => (
            <Carousel.Item key={item.id}>
              <div className="carousel-overlay"></div>
              <img 
                className="d-block w-100" 
                src={item.image} 
                alt={item.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80";
                }}
              />
              <Carousel.Caption className="carousel-caption">
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="display-3 fw-bold mb-4"
                >
                  {item.title}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="lead mb-4"
                >
                  {item.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Button 
                    variant="light" 
                    size="lg"
                    className="px-5 py-3 hover-lift"
                    onClick={() => document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' })}
                  >
                    <i className="bi bi-search me-2"></i>
                    Commencer la recherche
                  </Button>
                </motion.div>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      </section>

      {/* Statistiques */}
      <section className="stats-section py-5 bg-light">
        <Container>
          <Row className="g-4">
            <Col md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="stat-card text-center p-4"
              >
                <h3 className="display-4 fw-bold text-primary">{stats.total}</h3>
                <p className="text-muted mb-0">Propriétés disponibles</p>
              </motion.div>
            </Col>
            <Col md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="stat-card text-center p-4"
              >
                <h3 className="display-4 fw-bold text-success">{stats.forSale}</h3>
                <p className="text-muted mb-0">À vendre</p>
              </motion.div>
            </Col>
            <Col md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="stat-card text-center p-4"
              >
                <h3 className="display-4 fw-bold text-info">{stats.forRent}</h3>
                <p className="text-muted mb-0">À louer</p>
              </motion.div>
            </Col>
            <Col md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="stat-card text-center p-4"
              >
                <h3 className="display-4 fw-bold text-warning">{stats.averagePrice}</h3>
                <p className="text-muted mb-0">Prix moyen (DT)</p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Barre de recherche */}
      <section id="search-section" className="search-section py-5">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="search-card shadow-lg border-0">
              <Card.Body className="p-4">
                <h2 className="text-center mb-4">Trouvez votre propriété idéale</h2>
                
                <Row className="g-3">
                  <Col lg={4} md={6}>
                    <InputGroup>
                      <InputGroup.Text>
                        <i className="bi bi-search"></i>
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Rechercher par mot-clé, ville..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  
                  <Col lg={2} md={6}>
                    <InputGroup>
                      <InputGroup.Text>
                        <i className="bi bi-geo-alt"></i>
                      </InputGroup.Text>
                      <Form.Select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      >
                        <option value="">Toute localisation</option>
                        {locations.map((loc, index) => (
                          <option key={index} value={loc}>{loc}</option>
                        ))}
                      </Form.Select>
                    </InputGroup>
                  </Col>
                  
                  <Col lg={2} md={6}>
                    <InputGroup>
                      <InputGroup.Text>
                        <i className="bi bi-house-door"></i>
                      </InputGroup.Text>
                      <Form.Select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                      >
                        <option value="">Tous types</option>
                        {propertyTypes.map((type, index) => (
                          <option key={index} value={type}>{type}</option>
                        ))}
                      </Form.Select>
                    </InputGroup>
                  </Col>
                  
                  <Col lg={2} md={6}>
                    <InputGroup>
                      <InputGroup.Text>
                        <i className="bi bi-currency-dollar"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        placeholder="Prix max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        min="0"
                      />
                    </InputGroup>
                  </Col>
                  
                  <Col lg={2} md={6}>
                    <div className="d-grid gap-2">
                      <Button 
                        variant="primary" 
                        onClick={filterListings}
                        className="py-2 hover-lift"
                      >
                        <i className="bi bi-search me-2"></i>
                        Rechercher
                      </Button>
                    </div>
                  </Col>
                </Row>
                
                <div className="text-center mt-3">
                  <Button 
                    variant="link" 
                    onClick={resetFilters}
                    className="text-decoration-none"
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Réinitialiser les filtres
                  </Button>
                  
                  <Button 
                    variant="outline-primary" 
                    onClick={toggleMapView}
                    className="ms-3 hover-lift"
                  >
                    <i className={`bi ${showMap ? 'bi-list' : 'bi-map'} me-2`}></i>
                    {showMap ? 'Vue liste' : 'Vue carte'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* Résultats */}
      <section className="results-section py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              {filteredListings.length} propriété{filteredListings.length !== 1 ? 's' : ''} trouvée{filteredListings.length !== 1 ? 's' : ''}
            </h2>
            
            {(searchTerm || minPrice || maxPrice || location || propertyType) && (
              <div className="active-filters">
                {searchTerm && (
                  <Badge bg="light" text="dark" className="me-2 filter-badge">
                    {searchTerm} 
                    <i 
                      className="bi bi-x ms-1" 
                      onClick={() => setSearchTerm("")} 
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </Badge>
                )}
                {location && (
                  <Badge bg="light" text="dark" className="me-2 filter-badge">
                    {location} 
                    <i 
                      className="bi bi-x ms-1" 
                      onClick={() => setLocation("")} 
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </Badge>
                )}
                {propertyType && (
                  <Badge bg="light" text="dark" className="me-2 filter-badge">
                    {propertyType} 
                    <i 
                      className="bi bi-x ms-1" 
                      onClick={() => setPropertyType("")} 
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </Badge>
                )}
                {maxPrice && (
                  <Badge bg="light" text="dark" className="me-2 filter-badge">
                    Jusqu'à {maxPrice}DT 
                    <i 
                      className="bi bi-x ms-1" 
                      onClick={() => setMaxPrice("")} 
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" size="lg" />
              <p className="mt-3">Chargement des propriétés...</p>
            </div>
          ) : (
            <>
              {/* Vue Carte */}
              {showMap && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-5"
                >
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                      <div style={{ height: "500px", width: "100%" }}>
                        <MapContainer
                          center={mapCenter}
                          zoom={mapZoom}
                          style={{ height: "100%", width: "100%" }}
                          ref={mapRef}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                          />
                          {mapProperties.map((property) => (
                            <Marker 
                              key={property._id} 
                              position={[property.latitude, property.longitude]}
                              icon={createCustomIcon(property.price)}
                            >
                              <Popup>
                                <div className="map-popup">
                                  <h6>{property.title}</h6>
                                  <p className="text-primary fw-bold mb-2">{property.price}DT</p>
                                  <p className="text-muted mb-2">
                                    <i className="bi bi-geo-alt me-1"></i>
                                    {property.location}
                                  </p>
                                  {property.images && property.images[0] && (
                                    <img 
                                      src={`${API_BASE_URL}/${property.images[0]}`} 
                                      alt={property.title}
                                      className="img-fluid rounded mb-2"
                                      style={{ maxHeight: '100px', objectFit: 'cover' }}
                                    />
                                  )}
                                  <Button 
                                    size="sm"
                                    variant="primary"
                                    className="w-100 hover-lift"
                                    onClick={() => navigate(`/property/${property._id}`)}
                                  >
                                    Voir détails
                                  </Button>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        </MapContainer>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              )}

              {/* Vue Liste */}
              {!showMap && filteredListings.length > 0 ? (
                <div className="properties-grid-wrapper animate-slide-up">
                  <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                    {filteredListings.map((listing, index) => (
                      <Col 
                        key={listing._id || index} 
                        className="fade-in-on-scroll"
                      >
                        <ListingCard 
                          listing={listing} 
                          API_BASE_URL={API_BASE_URL}
                          navigate={navigate}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              ) : !showMap && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="no-results-state animate-fade-in"
                >
                  <div className="no-results-content">
                    <div className="no-results-icon">
                      <i className="bi bi-search-heart fs-1"></i>
                    </div>
                    <h3 className="no-results-title mb-3">Aucune propriété trouvée</h3>
                    <p className="no-results-text text-muted mb-4">
                      Aucune propriété ne correspond à vos critères de recherche
                    </p>
                    <div className="no-results-actions">
                      <Button 
                        variant="primary" 
                        onClick={resetFilters}
                        className="me-3 hover-lift"
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Réinitialiser les filtres
                      </Button>
                      <Link to="/add-listing">
                        <Button 
                          variant="outline-primary"
                          className="hover-lift"
                        >
                          <i className="bi bi-plus-circle me-2"></i>
                          Ajouter une annonce
                        </Button>
                      </Link>
                    </div>
                    <div className="search-tips mt-4">
                      <p className="text-muted small mb-2">Conseils de recherche :</p>
                      <div className="d-flex flex-wrap justify-content-center gap-2">
                        <Badge bg="light" text="dark" className="filter-tip">
                          <i className="bi bi-geo-alt me-1"></i>
                          Essayez une autre localisation
                        </Badge>
                        <Badge bg="light" text="dark" className="filter-tip">
                          <i className="bi bi-currency-euro me-1"></i>
                          Augmentez votre budget
                        </Badge>
                        <Badge bg="light" text="dark" className="filter-tip">
                          <i className="bi bi-house-door me-1"></i>
                          Changez le type de propriété
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5 position-relative overflow-hidden">
        <div className="cta-background">
          <div className="cta-shape cta-shape-1"></div>
          <div className="cta-shape cta-shape-2"></div>
          <div className="cta-shape cta-shape-3"></div>
        </div>
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="mb-4 mb-lg-0">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="display-5 fw-bold mb-3 text-white">
                  <span className="text-gradient">Vendez ou louez</span> votre propriété avec VABENE
                </h2>
                <p className="lead mb-0 text-white opacity-90">
                  Rejoignez notre réseau de professionnels et bénéficiez d'une visibilité maximale 
                  auprès de milliers d'acheteurs et locataires potentiels
                </p>
              </motion.div>
            </Col>
            <Col lg={4} className="text-lg-end">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link to="/add-listing">
                  <Button 
                    variant="light" 
                    size="lg"
                    className="cta-button hover-lift shadow-lg"
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="cta-button-icon me-2">
                        <i className="bi bi-plus-circle-fill"></i>
                      </div>
                      <div>
                        <div className="fw-bold">Déposer une annonce</div>
                        <small className="text-muted">C'est gratuit et rapide</small>
                      </div>
                    </div>
                  </Button>
                </Link>
                <div className="mt-3">
                  <Link to="/pro" className="text-white text-decoration-none small">
                    <i className="bi bi-stars me-1"></i>
                    Découvrir les offres Pro
                  </Link>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5 bg-white">
        <Container>
          <Row className="text-center">
            <Col md={3} className="mb-4 mb-md-0">
              <div className="stat-card glass-card p-4">
                <div className="stat-icon mb-3">
                  <i className="bi bi-building fs-1 text-primary"></i>
                </div>
                <h3 className="stat-number display-6 fw-bold mb-2">5,000+</h3>
                <p className="stat-label text-muted mb-0">Propriétés disponibles</p>
              </div>
            </Col>
            <Col md={3} className="mb-4 mb-md-0">
              <div className="stat-card glass-card p-4">
                <div className="stat-icon mb-3">
                  <i className="bi bi-people fs-1 text-primary"></i>
                </div>
                <h3 className="stat-number display-6 fw-bold mb-2">2,500+</h3>
                <p className="stat-label text-muted mb-0">Clients satisfaits</p>
              </div>
            </Col>
            <Col md={3} className="mb-4 mb-md-0">
              <div className="stat-card glass-card p-4">
                <div className="stat-icon mb-3">
                  <i className="bi bi-award fs-1 text-primary"></i>
                </div>
                <h3 className="stat-number display-6 fw-bold mb-2">150+</h3>
                <p className="stat-label text-muted mb-0">Agences partenaires</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-card glass-card p-4">
                <div className="stat-icon mb-3">
                  <i className="bi bi-clock-history fs-1 text-primary"></i>
                </div>
                <h3 className="stat-number display-6 fw-bold mb-2">24h</h3>
                <p className="stat-label text-muted mb-0">Support disponible</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-background"></div>
        <div className="footer-content py-5">
          <Container>
            <Row className="g-5">
              <Col lg={4} md={6}>
                <div className="footer-logo">
                  <div className="footer-logo-icon">
                    <i className="bi bi-house-heart"></i>
                  </div>
                  <div>
                    <div className="footer-logo-text">VABENE Immobilier</div>
                    <div className="footer-logo-tagline">Votre partenaire immobilier de confiance</div>
                  </div>
                </div>
                <p className="text-white opacity-75 mt-3 mb-4">
                  Leader immobilier en Tunisie, nous connectons propriétaires et acquéreurs 
                  grâce à une plateforme moderne et des services professionnels.
                </p>
                <div className="social-links">
                  <a href="#" className="social-link">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="#" className="social-link">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="#" className="social-link">
                    <i className="bi bi-linkedin"></i>
                  </a>
                  <a href="#" className="social-link">
                    <i className="bi bi-whatsapp"></i>
                  </a>
                  <a href="#" className="social-link">
                    <i className="bi bi-youtube"></i>
                  </a>
                </div>
              </Col>
              
              {/* <Col lg={2} md={6}>
                <h5 className="footer-heading">Navigation</h5>
                <ul className="footer-links">
                  <li>
                    <Link to="/" className="footer-link">
                      <i className="bi bi-house footer-link-icon"></i>
                      Accueil
                    </Link>
                  </li>
                  <li>
                    <Link to="/properties" className="footer-link">
                      <i className="bi bi-building footer-link-icon"></i>
                      Propriétés
                    </Link>
                  </li>
                  <li>
                    <Link to="/agencies" className="footer-link">
                      <i className="bi bi-buildings footer-link-icon"></i>
                      Agences
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="footer-link">
                      <i className="bi bi-info-circle footer-link-icon"></i>
                      À propos
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="footer-link">
                      <i className="bi bi-envelope footer-link-icon"></i>
                      Contact
                    </Link>
                  </li>
                </ul>
              </Col> */}
              
              <Col lg={3} md={6}>
                <h5 className="footer-heading">Contactez-nous</h5>
                <div className="footer-contact">
                  <div className="contact-item">
                    <i className="bi bi-telephone contact-icon"></i>
                    <div>
                      <div className="fw-semibold">+216 51 679 495</div>
                      <small className="opacity-75">Du lundi au vendredi</small>
                    </div>
                  </div>
                  <div className="contact-item">
                    <i className="bi bi-whatsapp contact-icon"></i>
                    <div>
                      <div className="fw-semibold">+216 51 679 495</div>
                      <small className="opacity-75">WhatsApp disponible</small>
                    </div>
                  </div>
                  <div className="contact-item">
                    <i className="bi bi-envelope contact-icon"></i>
                    <div>
                      <div className="fw-semibold">contact@vabene.tn</div>
                      <small className="opacity-75">Réponse sous 24h</small>
                    </div>
                  </div>
                  <div className="contact-item">
                    <i className="bi bi-geo-alt contact-icon"></i>
                    <div>
                      <div className="fw-semibold">Tunis, Tunisie</div>
                      <small className="opacity-75">Siège principal</small>
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col lg={3} md={6}>
                <h5 className="footer-heading">Newsletter</h5>
                <p className="text-white opacity-75 mb-3">
                  Inscrivez-vous pour recevoir les meilleures offres en exclusivité
                </p>
                <form className="newsletter-form">
                  <input 
                    type="email" 
                    className="newsletter-input" 
                    placeholder="Votre email"
                    required
                  />
                  <button type="submit" className="newsletter-button">
                    S'inscrire
                  </button>
                </form>
                <div className="mt-4">
                  <div className="security-badge d-inline-flex align-items-center gap-2 p-2 rounded">
                    <i className="bi bi-shield-check text-success"></i>
                    <small className="opacity-75">Site sécurisé • SSL actif</small>
                  </div>
                </div>
              </Col>
            </Row>
            
            <hr className="footer-divider" />
            
            <div className="footer-bottom">
              <div className="copyright">
                © {new Date().getFullYear()} VABENE Immobilier. Tous droits réservés.
              </div>
              <div className="footer-legal-links">
                <Link to="/privacy" className="legal-link">
                  Confidentialité
                </Link>
                <Link to="/terms" className="legal-link">
                  Conditions d'utilisation
                </Link>
                <Link to="/cookies" className="legal-link">
                  Cookies
                </Link>
                <Link to="/sitemap" className="legal-link">
                  Plan du site
                </Link>
              </div>
            </div>
          </Container>
        </div>
      </footer>
    </div>
  );
};

export default Home;