import React from "react";
import { Card, Button, Carousel } from "react-bootstrap";

const ListingItemOwner = ({ _id, title, price, images, onEdit, onDelete }) => {
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";
  return (
    <Card className="shadow-sm border-0 mb-4">
      {/* Carousel for multiple images */}
      <Carousel interval={null} indicators={images.length > 1}>
        {images.map((image, index) => (
          <Carousel.Item key={index}>
            <img
              src={`${API_BASE_URL}/${image}`} // Use the full URL to the image
              alt={`Image ${index + 1} of ${title}`}
              className="d-block w-100"
              style={{ height: "200px", objectFit: "cover", borderRadius: "5px" }}
            />
          </Carousel.Item>
        ))}
      </Carousel>

      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>
          <strong>💰 Prix:</strong> {price}DT
        </Card.Text>
        <div className="d-flex justify-content-between">
          <Button variant="primary" onClick={() => onEdit(_id)}>
            Modifier
          </Button>
          <Button variant="danger" onClick={() => onDelete(_id)}>
            Supprimer
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ListingItemOwner;