import { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Badge } from 'react-bootstrap';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/properties', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar imóveis');
      }

      const data = await response.json();
      setProperties(data.data.properties);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (propertyId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/properties/${propertyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar imóvel');
      }

      fetchProperties();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir imóvel');
      }

      fetchProperties();
    } catch (error) {
      setError(error.message);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      available: 'success',
      rented: 'primary',
      unavailable: 'danger'
    };

    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
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
    <div>
      <h1 className="mb-4">Gerenciar Imóveis</h1>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Título</th>
            <th>Endereço</th>
            <th>Preço</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Proprietário</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {properties.map(property => (
            <tr key={property._id}>
              <td>{property.title}</td>
              <td>{`${property.address.street}, ${property.address.neighborhood}`}</td>
              <td>AOA {property.price.toLocaleString()}</td>
              <td>{property.type}</td>
              <td>
                <select
                  className="form-select"
                  value={property.status}
                  onChange={(e) => handleUpdateStatus(property._id, e.target.value)}
                >
                  <option value="available">Disponível</option>
                  <option value="rented">Alugado</option>
                  <option value="unavailable">Indisponível</option>
                </select>
              </td>
              <td>{property.owner.name}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteProperty(property._id)}
                >
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Properties; 