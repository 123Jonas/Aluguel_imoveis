import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Sidebar = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserType(user.userType || '');
    setIsAdmin(user.isAdmin || false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const AdminMenu = () => (
    <div className="list-group list-group-flush">
      <Link to="/admin/dashboard" className="list-group-item list-group-item-action">
        <i className="bi bi-speedometer2 me-2"></i>Dashboard
      </Link>
      <Link to="/admin/users" className="list-group-item list-group-item-action">
        <i className="bi bi-people me-2"></i>Usuários
      </Link>
      <Link to="/admin/properties" className="list-group-item list-group-item-action">
        <i className="bi bi-houses me-2"></i>Imóveis
      </Link>
      <Link to="/admin/reports" className="list-group-item list-group-item-action">
        <i className="bi bi-bar-chart me-2"></i>Relatórios
      </Link>
      <Link to="/admin/settings" className="list-group-item list-group-item-action">
        <i className="bi bi-gear me-2"></i>Configurações
      </Link>
      <Link to="/profile" className="list-group-item list-group-item-action">
        <i className="bi bi-person me-2"></i>Perfil
      </Link>
      <button 
        onClick={handleLogout} 
        className="list-group-item list-group-item-action text-danger"
      >
        <i className="bi bi-box-arrow-right me-2"></i>Sair
      </button>
    </div>
  );

  const LandlordMenu = () => (
    <div className="list-group list-group-flush">
      <Link to="/landlord/properties" className="list-group-item list-group-item-action">
        <i className="bi bi-houses me-2"></i>Meus Imóveis
      </Link>
      <Link to="/landlord/add-property" className="list-group-item list-group-item-action">
        <i className="bi bi-plus-circle me-2"></i>Cadastrar Imóvel
      </Link>
      <Link to="/landlord/requests" className="list-group-item list-group-item-action">
        <i className="bi bi-file-earmark-text me-2"></i>Solicitações de Aluguel
      </Link>
      <Link to="/landlord/messages" className="list-group-item list-group-item-action">
        <i className="bi bi-chat-dots me-2"></i>Mensagens
      </Link>
      <Link to="/profile" className="list-group-item list-group-item-action">
        <i className="bi bi-person me-2"></i>Perfil
      </Link>
      <button 
        onClick={handleLogout} 
        className="list-group-item list-group-item-action text-danger"
      >
        <i className="bi bi-box-arrow-right me-2"></i>Sair
      </button>
    </div>
  );

  const TenantMenu = () => (
    <div className="list-group list-group-flush">
      <Link to="/tenant/search" className="list-group-item list-group-item-action">
        <i className="bi bi-search me-2"></i>Buscar Imóveis
      </Link>
      <Link to="/tenant/requests" className="list-group-item list-group-item-action">
        <i className="bi bi-file-earmark-text me-2"></i>Minhas Solicitações
      </Link>
      <Link to="/tenant/rented" className="list-group-item list-group-item-action">
        <i className="bi bi-house-check me-2"></i>Imóveis Alugados
      </Link>
      <Link to="/tenant/messages" className="list-group-item list-group-item-action">
        <i className="bi bi-chat-dots me-2"></i>Mensagens
      </Link>
      <Link to="/profile" className="list-group-item list-group-item-action">
        <i className="bi bi-person me-2"></i>Perfil
      </Link>
      <button 
        onClick={handleLogout} 
        className="list-group-item list-group-item-action text-danger"
      >
        <i className="bi bi-box-arrow-right me-2"></i>Sair
      </button>
    </div>
  );

  return (
    <div className="sidebar bg-light border-end" style={{ width: '280px', height: '100vh', position: 'fixed', top: '76px', left: 0, overflowY: 'auto' }}>
      {isAdmin && <AdminMenu />}
      {userType === 'landlord' && <LandlordMenu />}
      {userType === 'tenant' && <TenantMenu />}
    </div>
  );
};

export default Sidebar; 