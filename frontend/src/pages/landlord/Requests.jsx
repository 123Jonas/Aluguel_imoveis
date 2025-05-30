import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaHome, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rental-requests/received-requests', {
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

  const handleApprove = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rental-requests/${requestId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao aprovar solicitação');
      }

      toast.success('Solicitação aprovada com sucesso!');
      fetchRequests();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      toast.error('Por favor, forneça um motivo para a rejeição');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/rental-requests/${requestId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rejectionReason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao rejeitar solicitação');
      }

      toast.success('Solicitação rejeitada com sucesso!');
      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error(error.message);
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
        <h2>Solicitações Recebidas</h2>
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
                ? 'Você ainda não recebeu nenhuma solicitação de aluguel.'
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
                    <small className="text-muted">Inquilino: {request.tenant.name}</small>
                    {request.status === 'pending' && (
                      <div>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleApprove(request._id)}
                        >
                          Aprovar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          Rejeitar
                        </Button>
                      </div>
                    )}
            </div>
                  {request.status === 'rejected' && request.rejectionReason && (
                    <Alert variant="danger" className="mt-3 mb-0">
                      <strong>Motivo da rejeição:</strong> {request.rejectionReason}
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal de Rejeição */}
      <Modal show={!!selectedRequest} onHide={() => {
        setSelectedRequest(null);
        setRejectionReason('');
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Rejeitar Solicitação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Motivo da Rejeição</label>
            <textarea
              className="form-control"
              rows="3"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Digite o motivo da rejeição..."
            />
    </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setSelectedRequest(null);
            setRejectionReason('');
          }}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => handleReject(selectedRequest._id)}
            disabled={!rejectionReason.trim()}
          >
            Confirmar Rejeição
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Requests; 