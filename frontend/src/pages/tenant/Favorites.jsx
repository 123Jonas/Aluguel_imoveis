import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropertyCard from '../../components/PropertyCard';
import { apiUrl } from '../../config';

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/tenant/favorites`, { headers: authHeader() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFavorites(data.data.favorites);
    } catch (err) {
      toast.error(err.message || 'Erro ao carregar favoritos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const handleToggleFavorite = async (propertyId, isFav) => {
    const method = isFav ? 'DELETE' : 'POST';
    const res = await fetch(`${apiUrl}/api/tenant/favorites/${propertyId}`, {
      method,
      headers: authHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    if (isFav) {
      setFavorites(prev => prev.filter(p => p._id !== propertyId));
      toast.info('Removido dos favoritos');
    } else {
      toast.success('Adicionado aos favoritos');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <h4 className="mb-4">Meus Favoritos</h4>

      {favorites.length === 0 ? (
        <Alert variant="info">
          Você ainda não adicionou nenhum imóvel aos favoritos. Explore os imóveis disponíveis e clique no coração para guardar os seus preferidos.
        </Alert>
      ) : (
        <Row className="g-4">
          {favorites.map(property => (
            <Col key={property._id} xs={12} sm={6} lg={4}>
              <PropertyCard
                property={property}
                isFavorite={true}
                onToggleFavorite={handleToggleFavorite}
                onViewDetails={(id) => navigate(`/properties/${id}`)}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Favorites;
