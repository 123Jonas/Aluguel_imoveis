import React, { useState } from 'react';

const Requests = () => {
  const [requests, setRequests] = useState([]);

  // Aqui você pode adicionar um useEffect para carregar as solicitações do backend
  // useEffect(() => {
  //   // Carregar solicitações
  // }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Solicitações de Aluguel</h1>
      
      {requests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhuma solicitação encontrada.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div key={request.id} className="border rounded p-4 shadow-sm">
              {/* Conteúdo da solicitação */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests; 