import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon, FaBell, FaChevronDown } from 'react-icons/fa';
import { useNotifications } from '../contexts/NotificationContext';

const NOTIF_ICONS = {
  rental_request: '📋',
  rental_approved: '✅',
  rental_rejected: '❌',
  message: '💬',
  default: '🔔'
};

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [userType,   setUserType]     = useState('');
  const [userName,   setUserName]     = useState('');
  const [scrolled,   setScrolled]     = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isDarkMode, toggleTheme }   = useTheme();
  const { unreadCount, notifications, markAllRead } = useNotifications();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user  = JSON.parse(localStorage.getItem('user') || '{}');
      setIsLoggedIn(!!token);
      setUserType(user.userType || '');
      setUserName(user.name || '');
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserType('');
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (userType === 'admin')    return '/admin/dashboard';
    if (userType === 'landlord') return '/landlord/properties';
    return '/tenant/search';
  };

  const initials = userName
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U';

  const isHome = location.pathname === '/';

  return (
    <>
      <nav className={`navbar-custom${scrolled || !isHome ? ' navbar-custom--scrolled' : ''}`}>
        <div className="navbar-inner container">

          {/* ── Brand ── */}
          <Link className="navbar-brand-wrap" to="/">
            <img src="/logo-casa.jpg" alt="Boa Estadia" className="navbar-logo" />
            <span className="navbar-brand-name">Boa Estadia</span>
          </Link>

          {/* ── Center nav (public links) ── */}
          <div className="navbar-center-links d-none d-lg-flex">
            <Link to="/" className={`nav-clink${location.pathname === '/' ? ' active' : ''}`}>
              Imóveis
            </Link>
            <a
              href="#como-funciona"
              className="nav-clink"
              onClick={e => {
                if (location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Como funciona
            </a>
            {isLoggedIn && (
              <Link to={getDashboardLink()} className="nav-clink">
                Painel
              </Link>
            )}
          </div>

          {/* ── Right actions ── */}
          <div className="navbar-actions">

            {/* Theme toggle */}
            <button className="nav-icon-btn" onClick={toggleTheme} title={isDarkMode ? 'Modo claro' : 'Modo escuro'}>
              {isDarkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>

            {/* Notifications */}
            {isLoggedIn && (
              <div className="dropdown">
                <button
                  className="nav-icon-btn position-relative"
                  data-bs-toggle="dropdown"
                  onClick={markAllRead}
                  title="Notificações"
                >
                  <FaBell size={16} />
                  {unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>
                <div className="dropdown-menu dropdown-menu-end nav-notif-dropdown">
                  <div className="nav-notif-header">
                    <span className="fw-700">Notificações</span>
                    {unreadCount > 0 && (
                      <span className="badge rounded-pill" style={{ background: 'var(--brand-500)', fontSize: '0.7rem' }}>
                        {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="nav-notif-list">
                    {notifications.length === 0 ? (
                      <div className="nav-notif-empty">
                        <FaBell size={24} style={{ opacity: .25 }} />
                        <p>Sem notificações</p>
                      </div>
                    ) : (
                      notifications.slice(0, 6).map(n => (
                        <div key={n._id} className={`nav-notif-item${!n.read ? ' unread' : ''}`}>
                          <span className="nav-notif-icon">
                            {NOTIF_ICONS[n.type] || NOTIF_ICONS.default}
                          </span>
                          <div className="nav-notif-body">
                            <div className="nav-notif-title">{n.title}</div>
                            <div className="nav-notif-msg">{n.message}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Account */}
            {isLoggedIn ? (
              <div className="dropdown">
                <button className="nav-account-btn" data-bs-toggle="dropdown">
                  <span className="nav-avatar">{initials}</span>
                  <span className="nav-account-name d-none d-md-inline">
                    {userName.split(' ')[0]}
                  </span>
                  <FaChevronDown size={11} style={{ opacity: .6 }} />
                </button>
                <ul className="dropdown-menu dropdown-menu-end nav-account-dropdown">
                  <li className="nav-account-info">
                    <div className="nav-avatar nav-avatar--lg">{initials}</div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: '.9rem' }}>{userName}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-700)' }}>
                        {userType === 'admin' ? 'Administrador' : userType === 'landlord' ? 'Proprietário' : 'Inquilino'}
                      </div>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <Link className="dropdown-item nav-dd-item" to={getDashboardLink()}>
                      <i className="bi bi-speedometer2" /> Painel
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item nav-dd-item" to="/profile">
                      <i className="bi bi-person" /> Perfil
                    </Link>
                  </li>
                  {userType === 'tenant' && (
                    <li>
                      <Link className="dropdown-item nav-dd-item" to="/tenant/favorites">
                        <i className="bi bi-heart" /> Favoritos
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button className="dropdown-item nav-dd-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right" /> Terminar sessão
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login"   className="nav-btn-ghost">Entrar</Link>
                <Link to="/cadastro" className="nav-btn-solid">Criar conta</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div style={{ height: 72 }} />
    </>
  );
};

export default Navbar;
