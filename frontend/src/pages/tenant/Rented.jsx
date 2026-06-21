import React, { useState } from 'react';

const Rented = () => {
  const [rentedProperties, setRentedProperties] = useState([]);

  // Aqui você pode adicionar um useEffect para carregar os imóveis alugados do backend
  // useEffect(() => {
  //   // Carregar imóveis alugados
  // }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Meus Imóveis Alugados</h1>

      {rentedProperties.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Você não possui nenhum imóvel alugado no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentedProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-2">{property.location}</p>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Aluguel:</span>
                    <span className="font-semibold">R$ {property.rent}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Contrato até:</span>
                    <span>{new Date(property.contractEnd).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => {/* Adicionar lógica para ver detalhes */}}
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rented; 