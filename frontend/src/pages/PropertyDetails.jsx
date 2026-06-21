import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import {
  FaBed,
  FaBath,
  FaRuler,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaHome,
  FaComments,
  FaCheckCircle,
  FaBuilding
} from 'react-icons/fa';
import axios from 'axios';
import Chat from '../components/Chat';
import PropertyReviews from '../components/PropertyReviews';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [rentStartDate, setRentStartDate] = useState('');
  const [rentDuration, setRentDuration] = useState('12');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/api/properties/${id}`);
      setProperty(response.data.data.property);
    } catch (err) {
      setError('Erro ao carregar detalhes do imovel. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      await axios.post(
        `${apiUrl}/api/visits`,
        {
          property: id,
          date: visitDate,
          time: visitTime,
          notes: visitNotes
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSuccessMessage('Visita agendada com sucesso!');
      setShowVisitModal(false);
    } catch (err) {
      setError('Erro ao agendar visita. Por favor, tente novamente.');
    }
  };

  const handleRentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!rentStartDate) {
      setError('Por favor, selecione uma data de inicio.');
      return;
    }

    if (!rentDuration) {
      setError('Por favor, selecione a duracao do contrato.');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${apiUrl}/api/rental-requests/`,
        {
          propertyId: id,
          startDate: rentStartDate,
          endDate: new Date(new Date(rentStartDate).setMonth(new Date(rentStartDate).getMonth() + parseInt(rentDuration, 10))),
          message: ''
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        setSuccessMessage('Solicitacao de arrendamento enviada com sucesso. O proprietario sera notificado.');
        setShowRentModal(false);
        setError(null);
        setRentStartDate('');
        setRentDuration('12');
      }
    } catch (err) {
      let errorMessage = 'Erro ao solicitar arrendamento. Por favor, tente novamente.';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Sua sessao expirou. Por favor, faca login novamente.';
        navigate('/login');
      } else if (err.response?.status === 403) {
        errorMessage = 'Voce nao tem permissao para realizar esta acao.';
      }

      setError(errorMessage);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    return `${base}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error && !property) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Imovel nao encontrado.</Alert>
      </Container>
    );
  }

  return (
    <div className="property-details-page py-4 py-lg-5">
      <Container>
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible className="mb-4">
            <FaCheckCircle className="me-2" />
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-4">
            {error}
          </Alert>
        )}

        <Row className="g-4 align-items-start">
          <Col lg={8}>
            <Card className="border-0 property-hero-card overflow-hidden">
              <div className="position-relative">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={getImageUrl(property.images[0])}
                    alt={property.title}
                    className="img-fluid w-100 property-hero-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/1200x620?text=Sem+Imagem';
                    }}
                  />
                ) : (
                  <div className="property-hero-placeholder d-flex align-items-center justify-content-center">
                    <FaHome size={84} className="text-muted" />
                  </div>
                )}
                <Badge bg="dark" className="property-hero-badge">
                  {(property.type || 'imovel').toUpperCase()}
                </Badge>
              </div>

              <Card.Body className="p-4 p-lg-5">
                <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                  <div>
                    <h1 className="h3 mb-2">{property.title}</h1>
                    <p className="text-muted mb-0 d-flex align-items-center gap-2">
                      <FaMapMarkerAlt /> {property.location}
                    </p>
                  </div>
                  <div className="property-price-chip">KZ {Number(property.price || 0).toLocaleString()}</div>
                </div>

                <div className="property-metrics mb-4">
                  <span><FaBed /> {property.bedrooms || 0} quartos</span>
                  <span><FaBath /> {property.bathrooms || 0} banheiros</span>
                  <span><FaRuler /> {property.area || 0}m2</span>
                </div>

                <Card className="border-0 property-description-card">
                  <Card.Body>
                    <h2 className="h5 mb-2">Descricao</h2>
                    <p className="mb-0">{property.description || 'Sem descricao disponivel.'}</p>
                  </Card.Body>
                </Card>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 property-action-card mb-4">
              <Card.Body className="p-4">
                <h3 className="h5 mb-3">Acoes rapidas</h3>
                <p className="text-muted small mb-4">Escolha a melhor forma de avancar com este imovel.</p>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => (user ? setShowVisitModal(true) : navigate('/login'))}
                  >
                    <FaCalendarAlt className="me-2" /> Agendar visita
                  </Button>

                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => (user ? setShowRentModal(true) : navigate('/login'))}
                  >
                    Arrendar agora
                  </Button>

                  <Button
                    variant="outline-primary"
                    size="lg"
                    onClick={() => (user ? setShowChat(true) : navigate('/login'))}
                  >
                    <FaComments className="me-2" /> Chat com proprietario
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 property-owner-card">
              <Card.Body className="p-4">
                <h3 className="h5 mb-3 d-flex align-items-center gap-2"><FaBuilding /> Proprietario</h3>
                <p className="mb-2"><strong>Nome:</strong> {property.landlord?.name || 'Nao disponivel'}</p>
                <p className="mb-2 d-flex align-items-center gap-2"><FaPhone /> {property.landlord?.phone || 'Nao disponivel'}</p>
                <p className="mb-0 d-flex align-items-center gap-2"><FaEnvelope /> {property.landlord?.email || 'Nao disponivel'}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showVisitModal} onHide={() => setShowVisitModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Agendar visita</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleVisitSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Data da visita</Form.Label>
              <Form.Control type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Horario</Form.Label>
              <Form.Control type="time" value={visitTime} onChange={(e) => setVisitTime(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Observacoes</Form.Label>
              <Form.Control as="textarea" rows={3} value={visitNotes} onChange={(e) => setVisitNotes(e.target.value)} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowVisitModal(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Confirmar visita</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showRentModal}
        onHide={() => {
          setShowRentModal(false);
          setError(null);
          setSuccessMessage('');
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Solicitar arrendamento</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRentSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Data de inicio</Form.Label>
              <Form.Control
                type="date"
                value={rentStartDate}
                onChange={(e) => setRentStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              <Form.Text className="text-muted">A data de inicio deve ser futura.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Duracao (meses)</Form.Label>
              <Form.Select value={rentDuration} onChange={(e) => setRentDuration(e.target.value)} required>
                <option value="">Selecione a duracao</option>
                <option value="12">12 meses</option>
                <option value="24">24 meses</option>
                <option value="36">36 meses</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowRentModal(false);
                setError(null);
                setSuccessMessage('');
              }}
            >
              Cancelar
            </Button>
            <Button variant="success" type="submit">Confirmar arrendamento</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {property && <PropertyReviews propertyId={property._id} />}

      <Modal show={showChat} onHide={() => setShowChat(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chat com proprietario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {user && property && <Chat propertyId={property._id} otherUserId={property.landlord?._id} />}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PropertyDetails;
