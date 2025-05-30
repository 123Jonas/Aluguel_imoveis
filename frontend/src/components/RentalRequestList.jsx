import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';

const RentalRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const endpoint = user.userType === 'landlord' 
        ? 'http://localhost:5000/api/rental-requests/received-requests'
        : 'http://localhost:5000/api/rental-requests/my-requests';

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar solicitações');
      }

      setRequests(data.data.requests);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rental-requests/${requestId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao aprovar solicitação');
      }

      toast.success('Solicitação aprovada com sucesso!');
      fetchRequests();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      toast.error('Por favor, forneça um motivo para a rejeição');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/rental-requests/${requestId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rejectionReason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao rejeitar solicitação');
      }

      toast.success('Solicitação rejeitada com sucesso!');
      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning',
      approved: 'bg-success',
      rejected: 'bg-danger'
    };

    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado'
    };

    return (
      <span className={`badge ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-4">
          {user.userType === 'landlord' ? 'Solicitações Recebidas' : 'Minhas Solicitações'}
        </h5>
        
        {requests.length === 0 ? (
          <p className="text-muted text-center">
            {user.userType === 'landlord' 
              ? 'Nenhuma solicitação pendente'
              : 'Você ainda não fez nenhuma solicitação'}
          </p>
        ) : (
          <div className="list-group">
            {requests.map((request) => (
              <div key={request._id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">{request.property.title}</h6>
                  {getStatusBadge(request.status)}
                </div>
                
                <p className="mb-1">
                  <strong>
                    {user.userType === 'landlord' ? 'Inquilino:' : 'Proprietário:'}
                  </strong>{' '}
                  {user.userType === 'landlord' ? request.tenant.name : request.landlord.name}
                </p>
                <p className="mb-1">
                  <strong>Endereço:</strong> {request.property.address}
                </p>
                <p className="mb-1">
                  <strong>Período:</strong>{' '}
                  {format(new Date(request.startDate), 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                  {format(new Date(request.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
                
                {request.message && (
                  <p className="mb-2">
                    <strong>Mensagem:</strong> {request.message}
                  </p>
                )}

                {user.userType === 'landlord' && request.status === 'pending' && (
                  <div className="mt-3">
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleApprove(request._id)}
                    >
                      Aprovar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      Rejeitar
                    </button>
                  </div>
                )}

                {request.status === 'rejected' && request.rejectionReason && (
                  <p className="text-danger mt-2 mb-0">
                    <strong>Motivo da rejeição:</strong> {request.rejectionReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Rejeição */}
      {selectedRequest && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Rejeitar Solicitação</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Motivo da Rejeição</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Digite o motivo da rejeição..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleReject(selectedRequest._id)}
                >
                  Confirmar Rejeição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalRequestList; 