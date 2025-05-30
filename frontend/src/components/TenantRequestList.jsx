import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TenantRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rental-requests/my-requests', {
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
        <h5 className="card-title mb-4">Minhas Solicitações</h5>
        
        {requests.length === 0 ? (
          <p className="text-muted text-center">Você ainda não fez nenhuma solicitação</p>
        ) : (
          <div className="list-group">
            {requests.map((request) => (
              <div key={request._id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">{request.property.title}</h6>
                  {getStatusBadge(request.status)}
                </div>
                
                <p className="mb-1">
                  <strong>Proprietário:</strong> {request.landlord.name}
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
                    <strong>Sua mensagem:</strong> {request.message}
                  </p>
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
    </div>
  );
};

export default TenantRequestList; 