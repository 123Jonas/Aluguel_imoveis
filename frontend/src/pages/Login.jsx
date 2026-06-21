import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaCheckCircle, FaShieldAlt, FaKey, FaHeadset } from 'react-icons/fa';
import { socket } from '../socket';
import { apiUrl } from '../config';

const API_URL = apiUrl;

const schema = yup.object().shape({
  email: yup.string().email('Digite um email válido').required('Email é obrigatório'),
  password: yup.string().min(6, 'A senha deve ter pelo menos 6 caracteres').required('Senha é obrigatória')
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setApiError('');

      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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

      if (!result.token || !result.data || !result.data.user) {
        throw new Error('Resposta invalida do servidor');
      }

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      try {
        socket.auth.token = result.token;
        await new Promise((resolve, reject) => {
          socket.connect();
          socket.once('connect', resolve);
          socket.once('connect_error', reject);
        });
      } catch (socketError) {
        console.error('Erro ao conectar socket:', socketError);
      }

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
        setApiError('Erro de ligação. Verifique a sua internet.');
      } else if (error.message === 'Failed to fetch') {
        setApiError('Não foi possível conectar ao servidor. Verifique se o backend está a correr.');
      } else {
        setApiError(error.message || 'Erro ao iniciar sessão. Verifique as suas credenciais.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel auth-panel-brand d-none d-lg-flex">
        <Link to="/" className="auth-logo-link">
          <img src="/logo-casa.jpg" alt="Boa Estadia" height="44" />
        </Link>

        <h1>Aceda ao seu painel com segurança</h1>
        <p>
          Gestão de imóveis, solicitações e comunicação num único lugar,
          com um fluxo simples e profissional.
        </p>

        <div className="auth-benefits">
          <span><FaShieldAlt /> Sessão protegida e rastreável</span>
          <span><FaKey /> Recuperação rápida de acesso</span>
          <span><FaHeadset /> Suporte para inquilino e proprietário</span>
        </div>
      </section>

      <section className="auth-panel auth-panel-form">
        <div className="auth-form-wrap">
          <div className="text-center mb-4">
            <Link to="/" className="d-inline-block d-lg-none mb-3">
              <img src="/logo-casa.jpg" alt="Boa Estadia" height="38" />
            </Link>
            <h2 className="auth-title">Bem-vindo de volta</h2>
            <p className="auth-subtitle">Entre para continuar a sua jornada na plataforma.</p>
          </div>

          {successMessage && (
            <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
              <FaCheckCircle /> {successMessage}
            </div>
          )}

          {apiError && (
            <div className="alert alert-danger" role="alert">
              {apiError}
              {apiError.includes('verificar') && (
                <div className="mt-2">
                  <Link to="/resend-verification" className="alert-link small">
                    Reenviar email de verificação
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                placeholder="seu@email.com"
                {...register('email')}
              />
              {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
            </div>

            <div className="mb-3">
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
                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 auth-links-row">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="remember" />
                <label className="form-check-label" htmlFor="remember">Lembrar-me</label>
              </div>
              <Link to="/forgot-password" className="text-decoration-none">
                Esqueceu a senha?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100 mb-3" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Entrando...
                </>
              ) : (
                'Entrar na conta'
              )}
            </button>

            <div className="text-center small text-muted">
              Não tem conta?{' '}
              <Link to="/cadastro" className="text-decoration-none fw-semibold">
                Criar conta agora
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Login;
