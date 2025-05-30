import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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
import TenantRented from './pages/tenant/Rented.jsx';
import TenantMessages from './pages/tenant/Messages.jsx';
import Profile from './pages/Profile.jsx';
import EditProperty from './pages/landlord/EditProperty';
import PropertyDetails from './pages/PropertyDetails';
import AddUser from './pages/admin/AddUser';
import RentalRequestList from './components/RentalRequestList';
import TenantRequestList from './components/TenantRequestList';

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
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/recuperar-senha" element={<ForgotPassword />} />
          <Route path="/redefinir-senha/:token" element={<ResetPassword />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />

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
            path="/admin/users/add"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddUser />
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
          <Route
            path="/landlord/properties/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <EditProperty />
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

          {/* Rotas de recuperação de senha */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* New routes */}
          <Route
            path="/tenant/requests"
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantRequestList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/requests"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <RentalRequestList />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
