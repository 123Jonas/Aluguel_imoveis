import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaUserTag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import DeleteUserModal from '../components/DeleteUserModal';

// Adicione estilos inline para centralização e cores
const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
};
const cardStyle = {
  background: '#fff',
  borderRadius: '16px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  padding: '2.5rem',
  minWidth: '340px',
  maxWidth: '400px',
  width: '100%',
};
const labelStyle = {
  color: '#374151',
  fontWeight: 600,
  marginBottom: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};
const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  marginBottom: '1rem',
  fontSize: '1rem',
  background: '#f1f5f9',
  color: '#222',
};
const buttonStyle = {
  background: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)',
  color: '#fff',
  padding: '0.5rem 1.5rem',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'background 0.2s',
  marginRight: '0.5rem',
};
const cancelButtonStyle = {
  ...buttonStyle,
  background: 'linear-gradient(90deg, #64748b 0%, #334155 100%)',
};
const textStyle = {
  color: '#111827',
  fontSize: '1.05rem',
  fontWeight: 500,
};
const messageStyle = (type) => ({
  padding: '0.75rem',
  marginBottom: '1.5rem',
  borderRadius: '8px',
  textAlign: 'center',
  fontWeight: 600,
  color: type === 'success' ? '#166534' : '#b91c1c',
  background: type === 'success' ? '#bbf7d0' : '#fee2e2',
  border: `1px solid ${type === 'success' ? '#22c55e' : '#ef4444'}`,
});

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
    <>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: '#1e293b' }}>Meu Perfil</h1>

          {message.text && (
            <div style={messageStyle(message.type)}>
              {message.text}
            </div>
          )}

          {isEditing ? (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label><FaUser className="me-2" />Nome</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedProfile.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label><FaEnvelope className="me-2" />Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={editedProfile.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label><FaPhone className="me-2" />Telefone</Form.Label>
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
                <h5><FaUser className="me-2" />Nome</h5>
                <p className="ms-4">{profile.name}</p>
              </div>

              <div className="mb-4">
                <h5><FaEnvelope className="me-2" />Email</h5>
                <p className="ms-4">{profile.email}</p>
              </div>

              <div className="mb-4">
                <h5><FaPhone className="me-2" />Telefone</h5>
                <p className="ms-4">{profile.phone}</p>
              </div>

              <div className="mb-4">
                <h5><FaUserTag className="me-2" />Tipo de Usuário</h5>
                <p className="ms-4">{userTypeLabels[profile.userType] || profile.userType}</p>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="primary" onClick={handleEdit}>
                  Editar Perfil
                </Button>
                <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                  Excluir Conta
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <DeleteUserModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        userName={profile.name}
      />
    </>
  );
};

export default Profile; 