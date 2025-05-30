import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaHome, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rental-requests/my-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar solicitações');
      }

      setRequests(data.data.requests);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning',
      approved: 'bg-success',
      rejected: 'bg-danger'
    };

    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado'
    };

    return (
      <Badge bg={badges[status]} className="position-absolute top-0 end-0 m-2">
        {labels[status]}
      </Badge>
    );
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Minhas Solicitações</h2>
        <div className="btn-group">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline-primary'}
              onClick={() => setFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'pending' ? 'primary' : 'outline-primary'}
              onClick={() => setFilter('pending')}
            >
              Pendentes
            </Button>
            <Button
              variant={filter === 'approved' ? 'primary' : 'outline-primary'}
              onClick={() => setFilter('approved')}
            >
              Aprovadas
            </Button>
            <Button
              variant={filter === 'rejected' ? 'primary' : 'outline-primary'}
              onClick={() => setFilter('rejected')}
            >
            Rejeitadas
            </Button>
          </div>
      </div>

      {filteredRequests.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FaSearch className="fs-1 text-muted mb-3" />
            <h5>Nenhuma solicitação encontrada</h5>
            <p className="text-muted mb-0">
              {filter === 'all'
                ? 'Você ainda não fez nenhuma solicitação de aluguel.'
                : `Não há solicitações ${filter === 'pending' ? 'pendentes' : filter === 'approved' ? 'aprovadas' : 'recusadas'}.`}
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredRequests.map((request) => (
            <Col key={request._id} md={6} lg={4}>
              <Card className="h-100 shadow-sm">
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src={request.property.images?.[0] || 'https://via.placeholder.com/300x200'}
                    alt={request.property.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                    {getStatusBadge(request.status)}
                </div>
                <Card.Body>
                  <Card.Title className="mb-3">{request.property.title}</Card.Title>
                  <div className="d-flex align-items-center mb-2">
                    <FaMapMarkerAlt className="text-muted me-2" />
                    <small className="text-muted">{request.property.address}</small>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FaMoneyBillWave className="text-muted me-2" />
                    <small className="text-muted">R$ {request.property.price.toLocaleString()}/mês</small>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FaCalendarAlt className="text-muted me-2" />
                    <small className="text-muted">
                      {format(new Date(request.startDate), 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                      {format(new Date(request.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </small>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <FaClock className="text-muted me-2" />
                    <small className="text-muted">
                      Solicitado em {format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">Proprietário: {request.landlord.name}</small>
                    <Button variant="outline-primary" size="sm">
                      Ver Detalhes
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

export default Requests; 