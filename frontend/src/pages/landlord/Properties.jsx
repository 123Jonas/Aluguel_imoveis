import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Spinner, Form, InputGroup, Dropdown } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaHome, FaSearch, FaFilter, FaSort, FaMapMarkerAlt, FaMoneyBillWave, FaBed, FaBath, FaRuler } from 'react-icons/fa';

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      console.log('Fetching properties with token:', token ? 'Token exists' : 'No token');
      console.log('User data:', user);
      console.log('API URL:', apiUrl);

      if (!token) {
        throw new Error('Token não encontrado. Por favor, faça login novamente.');
      }

      const response = await axios.get(`${apiUrl}/api/landlord/properties`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('API Response:', response.data);

      if (response.data.status === 'success' && response.data.data.properties) {
        setProperties(response.data.data.properties);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        if (error.response.status === 401) {
          setError('Sessão expirada. Por favor, faça login novamente.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else if (error.response.status === 403) {
          setError('Você não tem permissão para acessar esta página.');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setError(error.response.data.message || 'Erro ao carregar imóveis');
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        setError('Erro ao carregar imóveis: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.delete(`${apiUrl}/api/landlord/properties/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProperties(properties.filter(property => property._id !== id));
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao excluir imóvel');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const apiUrl = import.meta.env.VITE_API_URL;
    return `${apiUrl}/${imagePath}`;
  };

  const filteredProperties = properties
    .filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Meus Imóveis</h1>
        <Button variant="primary" onClick={() => navigate('/landlord/properties/add')}>
          <FaPlus className="me-2" />
          Adicionar Imóvel
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por título ou localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os status</option>
                  <option value="available">Disponível</option>
                  <option value="rented">Alugado</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSort />
                </InputGroup.Text>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Mais recentes</option>
                  <option value="oldest">Mais antigos</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredProperties.length === 0 ? (
        <Alert variant="info">
          {searchTerm || statusFilter !== 'all'
            ? 'Nenhum imóvel encontrado com os filtros selecionados.'
            : 'Você ainda não cadastrou nenhum imóvel.'}
        </Alert>
      ) : (
        <Row className="g-4">
          {filteredProperties.map(property => (
            <Col key={property._id} md={6} lg={4}>
              <Card className="h-100 shadow-sm hover-shadow">
                <div className="position-relative">
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
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className={`badge bg-${property.status === 'available' ? 'success' : 'primary'} px-3 py-2`}>
                      {property.status === 'available' ? 'Disponível' : 'Alugado'}
                    </span>
                  </div>
                </div>
                <Card.Body>
                  <Card.Title className="mb-3">{property.title}</Card.Title>
                  
                  <div className="d-flex align-items-center mb-2">
                    <FaMapMarkerAlt className="text-muted me-2" />
                    <small className="text-muted">{property.location}</small>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2">
                    <FaMoneyBillWave className="text-muted me-2" />
                    <small className="text-muted">KZ {property.price.toLocaleString()}/mês</small>
                  </div>

                  <div className="d-flex gap-3 mb-3">
                    {property.bedrooms && (
                      <div className="d-flex align-items-center">
                        <FaBed className="text-muted me-1" />
                        <small className="text-muted">{property.bedrooms} quartos</small>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="d-flex align-items-center">
                        <FaBath className="text-muted me-1" />
                        <small className="text-muted">{property.bathrooms} banheiros</small>
                      </div>
                    )}
                    {property.area && (
                      <div className="d-flex align-items-center">
                        <FaRuler className="text-muted me-1" />
                        <small className="text-muted">{property.area}m²</small>
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/landlord/properties/edit/${property._id}`)}
                    >
                      <FaEdit className="me-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(property._id)}
                    >
                      <FaTrash className="me-1" />
                      Excluir
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Properties; 