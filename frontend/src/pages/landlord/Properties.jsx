import { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    rentedProperties: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/landlord/properties', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar imóveis');
      }

      const data = await response.json();
      setProperties(data.data.properties);
      
      // Calculate stats
      const stats = {
        totalProperties: data.data.properties.length,
        availableProperties: data.data.properties.filter(p => p.status === 'available').length,
        rentedProperties: data.data.properties.filter(p => p.status === 'rented').length,
        totalRevenue: data.data.properties
          .filter(p => p.status === 'rented')
          .reduce((acc, curr) => acc + curr.price, 0)
      };
      setStats(stats);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/landlord/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir imóvel');
      }

      fetchProperties();
    } catch (error) {
      setError(error.message);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      available: 'success',
      rented: 'primary',
      unavailable: 'danger'
    };

    const labels = {
      available: 'Disponível',
      rented: 'Alugado',
      unavailable: 'Indisponível'
    };

    return <Badge bg={variants[status] || 'secondary'}>{labels[status]}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Meus Imóveis</h1>
        <Link to="/landlord/properties/add" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i>
          Adicionar Imóvel
        </Link>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total de Imóveis</h6>
                  <h3 className="mb-0">{stats.totalProperties}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-houses fs-3 text-primary"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Disponíveis</h6>
                  <h3 className="mb-0">{stats.availableProperties}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-check-circle fs-3 text-success"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Alugados</h6>
                  <h3 className="mb-0">{stats.rentedProperties}</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-key fs-3 text-info"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Receita Mensal</h6>
                  <h3 className="mb-0">AOA {stats.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-cash fs-3 text-warning"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Título</th>
                <th>Endereço</th>
                <th>Tipo</th>
                <th>Preço</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(property => (
                <tr key={property._id}>
                  <td>{property.title}</td>
                  <td>{`${property.address.street}, ${property.address.neighborhood}`}</td>
                  <td>{property.type}</td>
                  <td>AOA {property.price.toLocaleString()}</td>
                  <td>{getStatusBadge(property.status)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link
                        to={`/landlord/properties/${property._id}/edit`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteProperty(property._id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Properties; 