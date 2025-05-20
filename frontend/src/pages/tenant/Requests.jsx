import React, { useState } from 'react';

const Requests = () => {
  const [requests, setRequests] = useState([]);

  // Aqui você pode adicionar um useEffect para carregar as solicitações do backend
  // useEffect(() => {
  //   // Carregar solicitações do inquilino
  // }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Minhas Solicitações de Aluguel</h1>

      {requests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Você ainda não fez nenhuma solicitação de aluguel.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{request.propertyTitle}</h3>
                  <p className="text-gray-600">{request.location}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {request.status === 'pending' ? 'Pendente' :
                   request.status === 'approved' ? 'Aprovado' : 'Recusado'}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Solicitado em: {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests; 