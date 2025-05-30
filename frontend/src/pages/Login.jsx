import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Navbar from '../components/Navbar';
import { socket } from '../socket';

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

      console.log('Tentando fazer login...');
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
      console.log('Resposta do servidor:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao fazer login');
      }

      if (!result.token || !result.data || !result.data.user) {
        throw new Error('Resposta inválida do servidor');
      }

      // Salvar o token e dados do usuário
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      
      console.log('Token armazenado:', result.token);
      console.log('Dados do usuário armazenados:', result.data.user);

      // Reconectar o socket com o novo token
      try {
        socket.auth.token = result.token;
        await new Promise((resolve, reject) => {
          socket.connect();
          socket.once('connect', resolve);
          socket.once('connect_error', reject);
        });
        console.log('Socket conectado com sucesso após login');
      } catch (socketError) {
        console.error('Erro ao conectar socket:', socketError);
        // Não interrompe o fluxo de login se houver erro no socket
      }

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

      console.log('Redirecionando para:', redirectPath);
      navigate(redirectPath);
      
    } catch (error) {
      console.error('Erro no login:', error);
      if (!window.navigator.onLine) {
        setApiError('Erro de conexão. Verifique sua internet.');
      } else if (error.message === 'Failed to fetch') {
        setApiError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      } else {
        setApiError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-vh-100 d-flex align-items-center" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="position-absolute w-100 h-100" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.5
        }}></div>
        <div className="container py-5 position-relative">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="card border-0 shadow-lg" style={{
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '15px'
              }}>
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
                      <Link to="/forgot-password" className="text-decoration-none">
                        Esqueceu sua senha?
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