import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Navbar from '../components/Navbar';

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Digite um email válido')
    .required('Email é obrigatório'),
  password: yup
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .required('Senha é obrigatória'),
});

const API_URL = 'http://localhost:5000/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setApiError('');

      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao fazer login');
      }

      // Salvar o token e dados do usuário
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      // Redirecionar baseado no tipo de usuário
      const userType = result.data.user.userType;
      let redirectPath = '/';

      switch (userType) {
        case 'admin':
          redirectPath = '/admin/dashboard';
          break;
        case 'landlord':
          redirectPath = '/landlord/properties';
          break;
        case 'tenant':
          redirectPath = '/tenant/search';
          break;
        default:
          redirectPath = '/';
      }

      navigate(redirectPath);
      
    } catch (error) {
      if (!window.navigator.onLine) {
        setApiError('Erro de conexão. Verifique sua internet.');
      } else if (error.message === 'Failed to fetch') {
        setApiError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      } else {
        setApiError(error.message);
      }
      console.error('Erro no login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-vh-100 d-flex align-items-center bg-light">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-5">
                  <div className="text-center mb-5">
                    <Link to="/" className="d-inline-block mb-4">
                      <img src="/logo.png" alt="Boa Estadia" height="40" />
                    </Link>
                    <h1 className="h3 mb-3">Bem-vindo de volta!</h1>
                    <p className="text-muted">Entre na sua conta para continuar</p>
                  </div>

                  {successMessage && (
                    <div className="alert alert-success" role="alert">
                      {successMessage}
                    </div>
                  )}

                  {apiError && (
                    <div className="alert alert-danger" role="alert">
                      {apiError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        placeholder="seu@email.com"
                        {...register('email')}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email.message}</div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="password" className="form-label">Senha</label>
                      <div className="input-group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                          id="password"
                          placeholder="Digite sua senha"
                          {...register('password')}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                        </button>
                        {errors.password && (
                          <div className="invalid-feedback">{errors.password.message}</div>
                        )}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="remember" />
                        <label className="form-check-label" htmlFor="remember">
                          Lembrar-se de mim
                        </label>
                      </div>
                      <Link to="/recuperar-senha" className="text-primary text-decoration-none">
                        Esqueceu a senha?
                      </Link>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg w-100 mb-4"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </button>

                    <div className="text-center">
                      <p className="mb-0">
                        Não tem uma conta?{' '}
                        <Link to="/cadastro" className="text-primary text-decoration-none">
                          Cadastre-se
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login; 