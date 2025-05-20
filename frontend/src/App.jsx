import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminProperties from './pages/admin/Properties.jsx';
import AdminReports from './pages/admin/Reports.jsx';
import AdminSettings from './pages/admin/Settings.jsx';
import LandlordProperties from './pages/landlord/Properties.jsx';
import LandlordAddProperty from './pages/landlord/AddProperty.jsx';
import LandlordRequests from './pages/landlord/Requests.jsx';
import LandlordMessages from './pages/landlord/Messages.jsx';
import TenantSearch from './pages/tenant/Search.jsx';
import TenantRequests from './pages/tenant/Requests.jsx';
import TenantRented from './pages/tenant/Rented.jsx';
import TenantMessages from './pages/tenant/Messages.jsx';
import Profile from './pages/Profile.jsx';

// Import Bootstrap and icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/index.css';

// Import Bootstrap JavaScript
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Componente para rotas protegidas
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.userType) && !user.isAdmin) {
    return <Navigate to="/" />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/recuperar-senha" element={<ForgotPassword />} />
          <Route path="/redefinir-senha/:token" element={<ResetPassword />} />

          {/* Rotas do Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          {/* Rotas do Proprietário */}
          <Route
            path="/landlord/properties"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <LandlordProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/add-property"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <LandlordAddProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/requests"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <LandlordRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/messages"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <LandlordMessages />
              </ProtectedRoute>
            }
          />

          {/* Rotas do Inquilino */}
          <Route
            path="/tenant/search"
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/requests"
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/rented"
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantRented />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/messages"
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantMessages />
              </ProtectedRoute>
            }
          />

          {/* Rota de Perfil (comum a todos os usuários logados) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
