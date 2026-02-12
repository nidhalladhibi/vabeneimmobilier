import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditProperty = () => {
  const { id } = useParams(); // Get the property ID from the URL
  const navigate = useNavigate(); // For navigation after editing
  const [property, setProperty] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/api/properties/property/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProperty(data);
      } catch (error) {
        console.error("Erreur de chargement de la propriété", error);
      }
    };
    fetchProperty();
  }, [id, API_BASE_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProperty({ ...property, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await axios.put(`${API_BASE_URL}/api/properties/${id}`, property, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Propriété mise à jour avec succès !");
      navigate("/my-properties"); // Redirect to the owner's properties page
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la propriété", error);
      alert("Erreur lors de la mise à jour de la propriété");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!property) return <p>Chargement...</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Modifier une annonce</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          type="text"
          name="title"
          placeholder="Titre"
          value={property.title}
          onChange={handleInputChange}
          required
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
        <input
          type="number"
          name="price"
          placeholder="Prix"
          value={property.price}
          onChange={handleInputChange}
          required
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={property.description}
          onChange={handleInputChange}
          required
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd", minHeight: "100px" }}
        />
        <input
          type="text"
          name="location"
          placeholder="Localisation"
          value={property.location}
          onChange={handleInputChange}
          required
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
        <button
          type="submit"
          disabled={isUpdating}
          style={{
            padding: "10px",
            backgroundColor: isUpdating ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {isUpdating ? "Mise à jour..." : "Mettre à jour"}
        </button>
      </form>
    </div>
  );
};

export default EditProperty;