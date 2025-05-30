import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaHome } from 'react-icons/fa';

const PropertyCard = ({ property, onViewDetails }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const apiUrl = import.meta.env.VITE_API_URL;
    return `${apiUrl}/${imagePath}`;
  };

  return (
    <Card className="h-100 shadow-sm">
      {property.images && property.images.length > 0 ? (
        <Card.Img
          variant="top"
          src={getImageUrl(property.images[0])}
          alt={property.title}
          style={{ height: '200px', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=Sem+Imagem';
          }}
        />
      ) : (
        <div 
          className="bg-light d-flex align-items-center justify-content-center" 
          style={{ height: '200px' }}
        >
          <FaHome size={50} className="text-muted" />
        </div>
      )}
      <Card.Body>
        <Card.Title className="text-truncate">{property.title}</Card.Title>
        <div className="mb-2">
          <div className="d-flex align-items-center mb-2">
            <FaMapMarkerAlt className="text-muted me-2" />
            <small className="text-muted">{property.location}</small>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <div className="d-flex align-items-center">
              <FaBed className="text-muted me-1" />
              <small>{property.bedrooms} quartos</small>
            </div>
            <div className="d-flex align-items-center">
              <FaBath className="text-muted me-1" />
              <small>{property.bathrooms} banheiros</small>
            </div>
            <div className="d-flex align-items-center">
              <FaRuler className="text-muted me-1" />
              <small>{property.area}m²</small>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-primary fw-bold">KZ {property.price.toLocaleString()}</div>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => onViewDetails(property._id)}
            >
              Ver Detalhes
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PropertyCard; 