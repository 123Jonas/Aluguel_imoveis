import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaUserTag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert, Container } from 'react-bootstrap';
import DeleteUserModal from '../components/DeleteUserModal';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    userType: '',
    // Adicione mais campos conforme necessário
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Carregar dados do usuário do localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setProfile({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      userType: user.userType || '',
    });
  }, []);

  const handleEdit = () => {
    setEditedProfile({ ...profile });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/users/profile`,
        editedProfile,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Atualizar dados no localStorage
      const updatedUser = { ...JSON.parse(localStorage.getItem('user')), ...editedProfile };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setProfile(editedProfile);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Erro ao atualizar perfil'
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Erro ao excluir conta'
      });
    }
  };

  const userTypeLabels = {
    tenant: 'Inquilino',
    landlord: 'Proprietário',
    admin: 'Administrador'
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
        <Card.Body className="p-4">
          <h1 className="text-center mb-4">Meu Perfil</h1>

          {message.text && (
            <Alert variant={message.type} className="mb-4">
              {message.text}
            </Alert>
          )}

          {isEditing ? (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center">
                  <FaUser className="me-2" />
                  Nome
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedProfile.name}
                  onChange={handleChange}
                  required
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
                  value={editedProfile.email}
                  onChange={handleChange}
                  required
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
                  value={editedProfile.phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Salvar Alterações
                </Button>
              </div>
            </Form>
          ) : (
            <>
              <div className="mb-4">
                <h5 className="d-flex align-items-center">
                  <FaUser className="me-2" />
                  Nome
                </h5>
                <p className="ms-4 mb-0">{profile.name}</p>
              </div>

              <div className="mb-4">
                <h5 className="d-flex align-items-center">
                  <FaEnvelope className="me-2" />
                  Email
                </h5>
                <p className="ms-4 mb-0">{profile.email}</p>
              </div>

              <div className="mb-4">
                <h5 className="d-flex align-items-center">
                  <FaPhone className="me-2" />
                  Telefone
                </h5>
                <p className="ms-4 mb-0">{profile.phone}</p>
              </div>

              <div className="mb-4">
                <h5 className="d-flex align-items-center">
                  <FaUserTag className="me-2" />
                  Tipo de Usuário
                </h5>
                <p className="ms-4 mb-0">{userTypeLabels[profile.userType] || profile.userType}</p>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="outline-primary" onClick={handleEdit}>
                  Editar Perfil
                </Button>
                <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)}>
                  Excluir Conta
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      <DeleteUserModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </Container>
  );
};

export default Profile; 