import { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Container } from 'react-bootstrap';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar usuários');
      }

      const data = await response.json();
      setUsers(data.data.users);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserType = async (userId, userType) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userType })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar usuário');
      }

      fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/admin/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir usuário');
      }

      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      setError(error.message);
    }
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
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Usuários</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/users/add')}
          className="d-flex align-items-center gap-2"
        >
          <FaPlus /> Novo Usuário
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Tipo</th>
            <th>Admin</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>
                <select
                  className="form-select"
                  value={user.userType}
                  onChange={(e) => handleUpdateUserType(user._id, e.target.value)}
                >
                  <option value="tenant">Inquilino</option>
                  <option value="landlord">Proprietário</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={user.isAdmin}
                    onChange={(e) => handleUpdateUserType(user._id, { isAdmin: e.target.checked })}
                  />
                </div>
              </td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(user)}
                >
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão de Usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        itemName={selectedUser?.name}
      />
    </Container>
  );
};

export default Users; 