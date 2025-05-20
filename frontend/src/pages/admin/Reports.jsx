import { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';

const Reports = () => {
  const [reports, setReports] = useState({
    monthlyRevenue: 0,
    activeContracts: 0,
    occupancyRate: 0,
    averageRent: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar relatórios');
      }

      const data = await response.json();
      setReports(data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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
    <div>
      <h1 className="mb-4">Relatórios</h1>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row className="g-4">
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Receita Mensal</h6>
                  <h3 className="mb-0">AOA {reports.monthlyRevenue.toLocaleString()}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-currency-dollar fs-3 text-primary"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Contratos Ativos</h6>
                  <h3 className="mb-0">{reports.activeContracts}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-file-earmark-text fs-3 text-success"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Taxa de Ocupação</h6>
                  <h3 className="mb-0">{reports.occupancyRate}%</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-pie-chart fs-3 text-info"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Aluguel Médio</h6>
                  <h3 className="mb-0">AOA {reports.averageRent.toLocaleString()}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-cash-stack fs-3 text-warning"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mt-4 shadow-sm">
        <Card.Body>
          <h5 className="card-title mb-4">Observações</h5>
          <ul className="list-unstyled mb-0">
            <li className="mb-3">
              <i className="bi bi-info-circle text-primary me-2"></i>
              Os dados apresentados são referentes ao mês atual
            </li>
            <li className="mb-3">
              <i className="bi bi-info-circle text-primary me-2"></i>
              A taxa de ocupação é calculada com base nos imóveis disponíveis
            </li>
            <li>
              <i className="bi bi-info-circle text-primary me-2"></i>
              O aluguel médio considera apenas contratos ativos
            </li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Reports; 