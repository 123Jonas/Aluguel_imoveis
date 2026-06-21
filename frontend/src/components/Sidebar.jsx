import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const NAV = {
  admin: [
    {
      label: 'Principal',
      items: [
        { to: '/admin/dashboard', icon: 'bi-speedometer2', text: 'Dashboard' },
        { to: '/admin/users',     icon: 'bi-people',       text: 'Utilizadores' },
        { to: '/admin/properties',icon: 'bi-houses',       text: 'Imóveis' },
      ]
    },
    {
      label: 'Análises',
      items: [
        { to: '/admin/reports',  icon: 'bi-bar-chart-line', text: 'Relatórios' },
        { to: '/admin/settings', icon: 'bi-gear',           text: 'Configurações' },
      ]
    },
    {
      label: 'Conta',
      items: [
        { to: '/profile', icon: 'bi-person-circle', text: 'Perfil' },
      ]
    }
  ],
  landlord: [
    {
      label: 'Imóveis',
      items: [
        { to: '/landlord/properties',    icon: 'bi-houses',         text: 'Meus Imóveis' },
        { to: '/landlord/add-property',  icon: 'bi-plus-circle',    text: 'Anunciar Imóvel' },
      ]
    },
    {
      label: 'Gestão',
      items: [
        { to: '/landlord/requests', icon: 'bi-file-earmark-text', text: 'Solicitações' },
        { to: '/landlord/messages', icon: 'bi-chat-dots',          text: 'Mensagens' },
      ]
    },
    {
      label: 'Conta',
      items: [
        { to: '/profile', icon: 'bi-person-circle', text: 'Perfil' },
      ]
    }
  ],
  tenant: [
    {
      label: 'Descobrir',
      items: [
        { to: '/tenant/search',    icon: 'bi-search',        text: 'Buscar Imóveis' },
        { to: '/tenant/favorites', icon: 'bi-heart',         text: 'Favoritos' },
      ]
    },
    {
      label: 'Os meus alugueres',
      items: [
        { to: '/tenant/requests', icon: 'bi-file-earmark-check', text: 'Solicitações' },
        { to: '/tenant/rented',   icon: 'bi-house-check',         text: 'Imóveis Alugados' },
        { to: '/tenant/messages', icon: 'bi-chat-dots',           text: 'Mensagens' },
      ]
    },
    {
      label: 'Conta',
      items: [
        { to: '/profile', icon: 'bi-person-circle', text: 'Perfil' },
      ]
    }
  ]
};

const ROLE_LABELS = {
  admin:    'Administrador',
  landlord: 'Proprietário',
  tenant:   'Inquilino'
};

const Sidebar = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [user, setUser] = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(stored);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const role = user.isAdmin ? 'admin' : user.userType;
  const sections = NAV[role] || [];

  const initials = (user.name || 'U')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <aside className="sidebar">
      {/* User info */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>
        <div style={{ minWidth: 0 }}>
          <div className="sidebar-user-name">{user.name || 'Utilizador'}</div>
          <div className="sidebar-user-role">{ROLE_LABELS[role] || 'Conta'}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section.label} className="mb-1">
            <span className="sidebar-section-label">{section.label}</span>
            {section.items.map(item => {
              const isActive = location.pathname === item.to ||
                (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`sidebar-link${isActive ? ' active' : ''}`}
                >
                  <i className={`bi ${item.icon} si`} />
                  {item.text}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right si" />
          Terminar sessão
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
