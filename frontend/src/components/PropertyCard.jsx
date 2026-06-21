import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaHome, FaArrowRight, FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { apiUrl } from '../config';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${apiUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const TYPE_LABELS = { apartment: 'Apartamento', house: 'Casa', commercial: 'Comercial' };

const PropertyCard = ({ property, onViewDetails, isFavorite = false, onToggleFavorite = null }) => {
  const [favorite, setFavorite]   = useState(isFavorite);
  const [toggling, setToggling]   = useState(false);

  const type     = (property.type || '').toLowerCase();
  const imageUrl = property.images?.[0] ? getImageUrl(property.images[0]) : null;

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    if (!onToggleFavorite || toggling) return;
    setToggling(true);
    try {
      await onToggleFavorite(property._id, favorite);
      setFavorite(f => !f);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="property-card card h-100 border-0" style={{ cursor: 'default' }}>
      {/* Image */}
      <div className="property-image-wrap">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={property.title}
            className="property-image"
            onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/700x420/e8f0fe/2563eb?text=Sem+Imagem'; }}
          />
        ) : (
          <div className="property-placeholder">
            <FaHome size={48} style={{ color: '#93b3e0', opacity: .6 }} />
          </div>
        )}

        {/* gradient overlay */}
        <div className="property-img-overlay" />

        {/* type badge */}
        <span className="property-type-badge badge">
          {TYPE_LABELS[type] || 'Imóvel'}
        </span>

        {/* favourite btn */}
        {onToggleFavorite && (
          <button
            className="property-fav-btn"
            onClick={handleToggleFavorite}
            disabled={toggling}
            title={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            {favorite
              ? <FaHeart color="#ef4444" size={15} />
              : <FaRegHeart color="#64748b" size={15} />}
          </button>
        )}
      </div>

      <div className="card-body d-flex flex-column">
        {/* title */}
        <h6 className="property-title text-truncate mb-1">{property.title}</h6>

        {/* location */}
        <div className="property-location mb-0">
          <FaMapMarkerAlt size={11} style={{ flexShrink: 0, color: '#94a3b8' }} />
          <span className="text-truncate">{property.location || 'Localização não informada'}</span>
        </div>

        {/* rating */}
        {property.averageRating > 0 && (
          <div className="property-rating">
            <FaStar size={12} color="#f59e0b" />
            <span className="fw-semibold" style={{ color: '#92400e' }}>
              {Number(property.averageRating).toFixed(1)}
            </span>
            <span style={{ color: '#94a3b8' }}>
              ({property.numReviews} avaliação{property.numReviews !== 1 ? 'ões' : ''})
            </span>
          </div>
        )}

        {/* features */}
        <div className="property-features">
          <span><FaBed size={12} /> {property.bedrooms ?? 0} quartos</span>
          <span><FaBath size={12} /> {property.bathrooms ?? 0} casa{property.bathrooms !== 1 ? 's' : ''} de banho</span>
          <span><FaRuler size={12} /> {property.area ?? 0} m²</span>
        </div>

        {/* price + cta */}
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div>
            <div className="property-price">
              KZ {Number(property.price || 0).toLocaleString('pt-AO')}
            </div>
            <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>por mês</small>
          </div>
          <Button
            variant="primary"
            size="sm"
            style={{ borderRadius: 8 }}
            onClick={() => onViewDetails && onViewDetails(property._id)}
          >
            Ver detalhes <FaArrowRight size={11} className="ms-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
