import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    userType: '',
    // Adicione mais campos conforme necessário
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  // Aqui você pode adicionar um useEffect para carregar os dados do perfil do backend
  // useEffect(() => {
  //   // Carregar dados do perfil
  // }, []);

  const handleEdit = () => {
    setEditedProfile({ ...profile });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica para salvar as alterações no backend
    console.log('Salvando alterações:', editedProfile);
    setProfile(editedProfile);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

      <div className="bg-white rounded-lg shadow p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Nome</label>
              <input
                type="text"
                name="name"
                value={editedProfile.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={editedProfile.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Telefone</label>
              <input
                type="tel"
                name="phone"
                value={editedProfile.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-600 mb-1">Nome</label>
              <p className="font-semibold">{profile.name}</p>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Email</label>
              <p className="font-semibold">{profile.email}</p>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Telefone</label>
              <p className="font-semibold">{profile.phone || 'Não informado'}</p>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Tipo de Usuário</label>
              <p className="font-semibold">
                {profile.userType === 'landlord' ? 'Proprietário' :
                 profile.userType === 'tenant' ? 'Inquilino' :
                 profile.userType === 'admin' ? 'Administrador' : 'Não definido'}
              </p>
            </div>
            <div>
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Editar Perfil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 