import React, { useState } from 'react';

const Search = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    type: 'all'
  });
  const [properties, setProperties] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica para buscar propriedades no backend
    console.log('Buscando com parâmetros:', searchParams);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Buscar Imóveis</h1>

      {/* Formulário de busca */}
      <form onSubmit={handleSearch} className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block mb-1">Localização</label>
            <input
              type="text"
              name="location"
              value={searchParams.location}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Digite a cidade ou bairro"
            />
          </div>
          <div>
            <label className="block mb-1">Preço Mínimo</label>
            <input
              type="number"
              name="minPrice"
              value={searchParams.minPrice}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="R$"
            />
          </div>
          <div>
            <label className="block mb-1">Preço Máximo</label>
            <input
              type="number"
              name="maxPrice"
              value={searchParams.maxPrice}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="R$"
            />
          </div>
          <div>
            <label className="block mb-1">Tipo de Imóvel</label>
            <select
              name="type"
              value={searchParams.type}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="all">Todos</option>
              <option value="house">Casa</option>
              <option value="apartment">Apartamento</option>
              <option value="commercial">Comercial</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Lista de resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600">Nenhum imóvel encontrado. Faça uma busca para ver resultados.</p>
          </div>
        ) : (
          properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Imagem do imóvel */}
              {property.image && (
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-2">{property.location}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">
                    R$ {property.price}
                  </span>
                  <button
                    onClick={() => {/* Adicionar lógica para ver detalhes */}}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Search; 