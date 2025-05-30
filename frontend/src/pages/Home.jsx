import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropertyCard from '../components/PropertyCard';
import { FaSearch, FaHome, FaBuilding, FaStore } from 'react-icons/fa';

// Configurar o axios
axios.defaults.withCredentials = true;

const Home = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    minPrice: '',
    maxPrice: '',
    location: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/api/properties/available`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      setProperties(response.data.data.properties);
    } catch (error) {
      console.error('Erro ao buscar propriedades:', error);
      setError('Erro ao carregar imóveis. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implementar lógica de busca
    console.log('Buscando com filtros:', filters);
  };

  const handleViewDetails = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">Encontre seu Lar Ideal</h1>
        <p className="lead text-muted">
          Explore nossa seleção de imóveis disponíveis para aluguel
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-light p-4 rounded-3 mb-5">
        <Form onSubmit={handleSearch}>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tipo de Imóvel</Form.Label>
                <Form.Select name="type" value={filters.type} onChange={handleFilterChange}>
                  <option value="all">Todos</option>
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="commercial">Comercial</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Preço Mínimo</Form.Label>
                <Form.Control
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="KZ"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Preço Máximo</Form.Label>
                <Form.Control
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="KZ"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Localização</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Cidade ou bairro"
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="text-center mt-3">
            <Button variant="primary" type="submit">
              <FaSearch className="me-2" />
              Buscar Imóveis
            </Button>
          </div>
        </Form>
      </div>

      {/* Properties Section */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {properties.length === 0 ? (
        <Alert variant="info">
          Nenhum imóvel disponível no momento.
        </Alert>
      ) : (
        <Row>
          {properties.map(property => (
            <Col key={property._id} md={6} lg={4} className="mb-4">
              <PropertyCard
                property={property}
                onViewDetails={handleViewDetails}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Home; 