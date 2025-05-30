import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt, FaHome, FaComments } from 'react-icons/fa';
import axios from 'axios';
import Chat from '../components/Chat';

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
    // Verificar se o usuário está logado
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
    } catch (error) {
      setError('Erro ao carregar detalhes do imóvel. Por favor, tente novamente mais tarde.');
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
    } catch (error) {
      setError('Erro ao agendar visita. Por favor, tente novamente.');
    }
  };

  const handleRentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    // Validação dos campos
    if (!rentStartDate) {
      setError('Por favor, selecione uma data de início.');
      return;
    }

    if (!rentDuration) {
      setError('Por favor, selecione a duração do contrato.');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      // Log para debug
      console.log('Token:', token);
      console.log('Enviando requisição:', {
        propertyId: id,
        startDate: rentStartDate,
        endDate: new Date(new Date(rentStartDate).setMonth(new Date(rentStartDate).getMonth() + parseInt(rentDuration))),
        message: ''
      });

      const response = await axios.post(
        `${apiUrl}/api/rental-requests/`,
        {
          propertyId: id,
          startDate: rentStartDate,
          endDate: new Date(new Date(rentStartDate).setMonth(new Date(rentStartDate).getMonth() + parseInt(rentDuration))),
          message: ''
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Resposta do servidor:', response.data);

      if (response.data.status === 'success') {
        setSuccessMessage('Solicitação de arrendamento enviada com sucesso! O proprietário será notificado.');
      setShowRentModal(false);
        setError(null);
        // Limpar os campos do formulário
        setRentStartDate('');
        setRentDuration('12');
      }
    } catch (error) {
      console.error('Erro detalhado:', error);
      console.error('Resposta do servidor:', error.response?.data);
      
      let errorMessage = 'Erro ao solicitar arrendamento. Por favor, tente novamente.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
        navigate('/login');
      } else if (error.response?.status === 403) {
        errorMessage = 'Você não tem permissão para realizar esta ação.';
      }

      setError(errorMessage);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const apiUrl = import.meta.env.VITE_API_URL;
    return `${apiUrl}/${imagePath}`;
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

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Imóvel não encontrado.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
          {successMessage}
        </Alert>
      )}

      <Row>
        {/* Galeria de Imagens */}
        <Col lg={8} className="mb-4">
          <div className="position-relative">
            {property.images && property.images.length > 0 ? (
              <img
                src={getImageUrl(property.images[0])}
                alt={property.title}
                className="img-fluid rounded"
                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x400?text=Sem+Imagem';
                }}
              />
            ) : (
              <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{ height: '400px' }}>
                <FaHome size={100} className="text-muted" />
              </div>
            )}
          </div>
        </Col>

        {/* Informações Principais */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body>
              <h2 className="h4 mb-3">{property.title}</h2>
              <h3 className="h5 text-primary mb-4">KZ {property.price.toLocaleString()}</h3>
              
              <div className="d-flex justify-content-between mb-4">
                <Button 
                  variant="primary" 
                  className="w-100 me-2"
                  onClick={() => user ? setShowVisitModal(true) : navigate('/login')}
                >
                  <FaCalendarAlt className="me-2" />
                  Agendar Visita
                </Button>
                <Button 
                  variant="success" 
                  className="w-100 ms-2"
                  onClick={() => user ? setShowRentModal(true) : navigate('/login')}
                >
                  Arrendar
                </Button>
              </div>

              <Button 
                variant="outline-primary" 
                className="w-100 mb-3"
                onClick={() => user ? setShowChat(true) : navigate('/login')}
              >
                <FaComments className="me-2" />
                Chat com Proprietário
              </Button>

              <div className="border-top pt-3">
                <h4 className="h6 mb-3">Detalhes do Imóvel</h4>
                <div className="d-flex justify-content-between mb-2">
                  <span><FaBed className="me-2" /> Quartos</span>
                  <span>{property.bedrooms}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span><FaBath className="me-2" /> Banheiros</span>
                  <span>{property.bathrooms}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span><FaRuler className="me-2" /> Área</span>
                  <span>{property.area}m²</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span><FaMapMarkerAlt className="me-2" /> Localização</span>
                  <span>{property.location}</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Informações do Proprietário */}
          <Card>
            <Card.Body>
              <h4 className="h6 mb-3">Informações do Proprietário</h4>
              <p className="mb-2">
                <strong>Nome:</strong> {property.landlord?.name || 'Não disponível'}
              </p>
              <p className="mb-2">
                <FaPhone className="me-2" />
                {property.landlord?.phone || 'Não disponível'}
              </p>
              <p className="mb-0">
                <FaEnvelope className="me-2" />
                {property.landlord?.email || 'Não disponível'}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Descrição */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              <h4 className="h5 mb-3">Descrição</h4>
              <p>{property.description}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de Agendamento de Visita */}
      <Modal show={showVisitModal} onHide={() => setShowVisitModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agendar Visita</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleVisitSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Data da Visita</Form.Label>
              <Form.Control
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Horário</Form.Label>
              <Form.Control
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowVisitModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Confirmar Visita
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Arrendamento */}
      <Modal show={showRentModal} onHide={() => {
        setShowRentModal(false);
        setError(null);
        setSuccessMessage(null);
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Solicitar Arrendamento</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRentSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            {successMessage && (
              <Alert variant="success" className="mb-3">
                {successMessage}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Data de Início</Form.Label>
              <Form.Control
                type="date"
                value={rentStartDate}
                onChange={(e) => setRentStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              <Form.Text className="text-muted">
                A data de início deve ser futura
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Duração (meses)</Form.Label>
              <Form.Select
                value={rentDuration}
                onChange={(e) => setRentDuration(e.target.value)}
                required
              >
                <option value="">Selecione a duração</option>
                <option value="12">12 meses</option>
                <option value="24">24 meses</option>
                <option value="36">36 meses</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowRentModal(false);
              setError(null);
              setSuccessMessage(null);
            }}>
              Cancelar
            </Button>
            <Button variant="success" type="submit">
              Confirmar Arrendamento
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Chat */}
      <Modal show={showChat} onHide={() => setShowChat(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chat com Proprietário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {user && property && (
            <Chat
              propertyId={property._id}
              otherUserId={property.landlord._id}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PropertyDetails; 