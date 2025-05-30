import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { FaHome, FaMapMarkerAlt, FaMoneyBillWave, FaBed, FaBath, FaRuler } from 'react-icons/fa';
import SuccessModal from '../../components/SuccessModal';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    type: 'apartment',
    status: 'available',
    features: [],
    images: []
  });
  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/landlord/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const property = response.data.data.property;
        
        // Garantir que todos os campos tenham valores padrão
        setFormData({
          title: property.title || '',
          description: property.description || '',
          price: property.price || '',
          location: property.location || '',
          address: property.address || '',
          bedrooms: property.bedrooms || '',
          bathrooms: property.bathrooms || '',
          area: property.area || '',
          type: property.type || 'apartment',
          status: property.status || 'available',
          features: property.features || [],
          images: property.images || []
        });
        
        setPreviewImages(property.images || []);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar propriedade:', err);
        setError(err.response?.data?.message || 'Erro ao carregar propriedade');
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeaturesChange = (e) => {
    const features = e.target.value.split(',').map(feature => feature.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      features
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);

    // Criar previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    if (index < formData.images.length) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      setNewImages(prev => prev.filter((_, i) => i !== (index - formData.images.length)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      // Adicionar campos básicos
      Object.keys(formData).forEach(key => {
        if (key !== 'images' && key !== 'features') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Adicionar features como JSON string
      formDataToSend.append('features', JSON.stringify(formData.features));

      // Adicionar novas imagens
      newImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      // Adicionar URLs das imagens existentes
      formData.images.forEach(image => {
        formDataToSend.append('existingImages', image);
      });

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/landlord/properties/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Propriedade atualizada com sucesso!');
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar propriedade');
      toast.error(err.response?.data?.message || 'Erro ao atualizar propriedade');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/landlord/properties');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <Container className="py-4">
      <h1 className="text-2xl font-bold mb-4">Editar Imóvel</h1>
      
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
              <Form.Label><FaMapMarkerAlt className="me-2" />Localização</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Ex: Luanda, Maianga"
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
                placeholder="Ex: Rua Principal, 123"
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
          <Form.Label>Características (separadas por vírgula)</Form.Label>
          <Form.Control
            type="text"
            value={formData.features.join(', ')}
            onChange={handleFeaturesChange}
            placeholder="Ex: Piscina, Garagem, Segurança 24h"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Imagens</Form.Label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <Form.Control
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="mt-2"
          />
        </Form.Group>

        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={() => navigate('/landlord/properties')} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Atualizando...
              </>
            ) : (
              'Atualizar Imóvel'
            )}
          </Button>
        </div>
      </Form>

      <SuccessModal
        show={showSuccessModal}
        onHide={handleSuccessModalClose}
        message="Imóvel atualizado com sucesso!"
        onConfirm={handleSuccessModalClose}
      />
    </Container>
  );
};

export default EditProperty; 