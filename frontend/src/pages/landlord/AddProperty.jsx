import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { FaHome, FaMapMarkerAlt, FaMoneyBillWave, FaBed, FaBath, FaRuler } from 'react-icons/fa';

const AddProperty = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    type: 'apartment', // apartment, house, commercial
    status: 'available', // available, rented
    features: [],
    images: []
  });

  useEffect(() => {
    const checkUser = () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');

      if (!token || !user) {
        setMessage({
          type: 'danger',
          text: 'Você precisa estar logado para acessar esta página.'
        });
        navigate('/login');
        return false;
      }

      if (user.userType !== 'landlord') {
        setMessage({
          type: 'danger',
          text: 'Apenas proprietários podem adicionar imóveis.'
        });
        navigate('/');
        return false;
      }

      return true;
    };

    checkUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar novamente se o usuário é um proprietário antes de enviar
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.userType !== 'landlord') {
      setMessage({
        type: 'danger',
        text: 'Apenas proprietários podem adicionar imóveis.'
      });
      navigate('/');
      return;
    }

    setIsLoading(true); // Iniciar loading

    try {
      const token = localStorage.getItem('token');
      
      // Criar um FormData para enviar os arquivos
      const formDataToSend = new FormData();
      
      // Adicionar campos do formulário
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          formData.images.forEach((image, index) => {
            formDataToSend.append(`images`, image);
          });
        } else if (key === 'features') {
          formDataToSend.append('features', JSON.stringify(formData.features));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await axios.post(
        `${apiUrl}/api/landlord/properties`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage({
        type: 'success',
        text: 'Imóvel cadastrado com sucesso!'
      });

      // Redirecionar para a lista de imóveis após 2 segundos
      setTimeout(() => {
        navigate('/landlord/properties');
      }, 2000);
    } catch (error) {
      console.error('Erro ao cadastrar imóvel:', error);
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Erro ao cadastrar imóvel'
      });
    } finally {
      setIsLoading(false); // Finalizar loading
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFeatureChange = (feature) => {
    setFormData(prevState => ({
      ...prevState,
      features: prevState.features.includes(feature)
        ? prevState.features.filter(f => f !== feature)
        : [...prevState.features, feature]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      setMessage({
        type: 'danger',
        text: 'Você pode adicionar no máximo 5 imagens'
      });
      return;
    }
    setFormData(prevState => ({
      ...prevState,
      images: [...prevState.images, ...files]
    }));
  };

  return (
    <Container className="py-4">
      <h1 className="text-2xl font-bold mb-4">Adicionar Novo Imóvel</h1>
      
      {message.text && (
        <Alert variant={message.type} className="mb-4">
          {message.text}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label><FaHome className="me-2" />Título</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Ex: Apartamento 2 quartos no centro"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label><FaMoneyBillWave className="me-2" />Preço (KZ)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="Ex: 1500"
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Descrição</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Descreva detalhes do imóvel..."
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label><FaMapMarkerAlt className="me-2" />Cidade</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Ex: São Paulo"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Endereço</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Ex: Rua das Flores, 123"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label><FaBed className="me-2" />Quartos</Form.Label>
              <Form.Control
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                required
                min="0"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label><FaBath className="me-2" />Banheiros</Form.Label>
              <Form.Control
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                required
                min="0"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label><FaRuler className="me-2" />Área (m²)</Form.Label>
              <Form.Control
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                min="0"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Imóvel</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="apartment">Apartamento</option>
                <option value="house">Casa</option>
                <option value="commercial">Comercial</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="available">Disponível</option>
                <option value="rented">Alugado</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Características</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {['Mobiliado', 'Garagem', 'Piscina', 'Academia', 'Segurança 24h', 'Área de Lazer'].map((feature) => (
              <Form.Check
                key={feature}
                type="checkbox"
                id={feature}
                label={feature}
                checked={formData.features.includes(feature)}
                onChange={() => handleFeatureChange(feature)}
                className="me-2"
              />
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Imagens</Form.Label>
          <Form.Control
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
          <Form.Text className="text-muted">
            Selecione até 5 imagens do imóvel
          </Form.Text>
          {formData.images.length > 0 && (
            <div className="mt-2">
              <small>Imagens selecionadas: {formData.images.length}</small>
            </div>
          )}
        </Form.Group>

        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={() => navigate('/landlord/properties')} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Cadastrando...
              </>
            ) : (
              'Cadastrar Imóvel'
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddProperty; 