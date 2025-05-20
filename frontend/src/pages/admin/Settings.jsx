import { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoApproveRequests: false,
    maintenanceMode: false,
    defaultCurrency: 'AOA'
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações');
      }

      setSuccess(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div>
      <h1 className="mb-4">Configurações</h1>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-4">
          Configurações salvas com sucesso!
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Notificações</Form.Label>
              <div>
                <Form.Check
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  label="Enviar notificações por email"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Aprovação de Solicitações</Form.Label>
              <div>
                <Form.Check
                  type="checkbox"
                  id="autoApproveRequests"
                  name="autoApproveRequests"
                  label="Aprovar solicitações automaticamente"
                  checked={settings.autoApproveRequests}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Modo de Manutenção</Form.Label>
              <div>
                <Form.Check
                  type="checkbox"
                  id="maintenanceMode"
                  name="maintenanceMode"
                  label="Ativar modo de manutenção"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Moeda Padrão</Form.Label>
              <Form.Select
                name="defaultCurrency"
                value={settings.defaultCurrency}
                onChange={handleChange}
              >
                <option value="AOA">Kwanza (AOA)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </Form.Select>
            </Form.Group>

            <div className="d-grid">
              <Button type="submit" variant="primary">
                Salvar Configurações
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mt-4 shadow-sm">
        <Card.Body>
          <h5 className="card-title mb-4">Informações do Sistema</h5>
          <div className="mb-3">
            <strong>Versão:</strong> 1.0.0
          </div>
          <div className="mb-3">
            <strong>Última Atualização:</strong> {new Date().toLocaleDateString()}
          </div>
          <div>
            <strong>Status:</strong>{' '}
            <span className="text-success">
              <i className="bi bi-check-circle me-1"></i>
              Operacional
            </span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Settings; 