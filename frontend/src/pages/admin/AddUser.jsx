import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUserTag } from 'react-icons/fa';

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'tenant' // valor padrão
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validação básica
    if (formData.password !== formData.confirmPassword) {
      setMessage({
        type: 'danger',
        text: 'As senhas não coincidem'
      });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      // Remover confirmPassword antes de enviar
      const { confirmPassword, ...userData } = formData;
      
      const response = await axios.post(
        `${apiUrl}/api/admin/users`,
        userData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessage({
        type: 'success',
        text: 'Usuário cadastrado com sucesso!'
      });

      // Limpar formulário
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        userType: 'tenant'
      });

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);

    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Erro ao cadastrar usuário'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
        <Card.Body className="p-4">
          <h1 className="text-center mb-4">Cadastrar Novo Usuário</h1>

          {message.text && (
            <Alert variant={message.type} className="mb-4">
              {message.text}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <FaUser className="me-2" />
                Nome Completo
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Digite o nome completo"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <FaEnvelope className="me-2" />
                Email
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Digite o email"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <FaPhone className="me-2" />
                Telefone
              </Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Digite o telefone"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <FaUserTag className="me-2" />
                Tipo de Usuário
              </Form.Label>
              <Form.Select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                required
              >
                <option value="tenant">Inquilino</option>
                <option value="landlord">Proprietário</option>
                <option value="admin">Administrador</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <FaLock className="me-2" />
                Senha
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Digite a senha"
                minLength="6"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="d-flex align-items-center">
                <FaLock className="me-2" />
                Confirmar Senha
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirme a senha"
                minLength="6"
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/admin/users')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddUser; 