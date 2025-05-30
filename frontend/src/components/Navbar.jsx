import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setIsLoggedIn(!!token);
      setUserType(user.userType || '');
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserType('');
    navigate('/login');
  };

  const getDashboardLink = () => {
    switch (userType) {
      case 'admin':
        return '/admin/dashboard';
      case 'landlord':
        return '/landlord/properties';
      case 'tenant':
        return '/tenant/search';
      default:
        return '/';
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top shadow-sm">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src="/logo.png" alt="Boa Estadia" height="30" />
          </Link>

          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-secondary"
              onClick={toggleTheme}
              title={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>

            {isLoggedIn ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-2"></i>
                  Minha Conta
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to={getDashboardLink()}>
                      <i className="bi bi-speedometer2 me-2"></i>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2"></i>
                      Perfil
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Sair
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-primary">Entrar</Link>
                <Link to="/cadastro" className="btn btn-primary">Criar Conta</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      {/* Espaçador para compensar o navbar fixo */}
      <div style={{ paddingTop: '76px' }}></div>
    </>
  );
};

export default Navbar; 