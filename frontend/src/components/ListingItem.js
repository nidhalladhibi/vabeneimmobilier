import React from "react";
import { useSelector } from "react-redux";

const ListingItem = ({ title, price, image }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";
  return (
    <div style={{ border: "1px solid #ddd", padding: "10px", margin: "10px", borderRadius: "5px" }}>
      <img
        src={`${API_BASE_URL}/${image}`} // Use the full URL to the image
        alt={title}
        style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "5px" }}
      />
      <h3>{title}</h3>
      <p>💰 Prix: {price}DT</p>
    </div>
  );
};

export default ListingItem;
