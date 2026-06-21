import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaCheckCircle, FaUsers, FaClipboardCheck, FaRocket } from 'react-icons/fa';
import { apiUrl } from '../config';

const API_URL = apiUrl;

const schema = yup.object().shape({
  name: yup.string().required('Nome e obrigatorio').min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: yup.string().email('Digite um email valido').required('Email e obrigatorio'),
  phone: yup.string().required('Telefone e obrigatorio').matches(/^\+?[1-9]\d{1,14}$/, 'Digite um numero de telefone valido'),
  password: yup.string().required('Senha e obrigatoria').min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'As senhas devem coincidir').required('Confirmacao de senha e obrigatoria'),
  userType: yup.string().oneOf(['tenant', 'landlord'], 'Selecione um tipo de usuario').required('Tipo de usuario e obrigatorio'),
  terms: yup.boolean().oneOf([true], 'Voce deve aceitar os termos de uso')
});

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      setSuccessMessage('');

      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          passwordConfirm: data.confirmPassword,
          userType: data.userType
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao criar conta');
      }

      setSuccessMessage('Conta criada com sucesso! Verifique o seu email para activar a conta antes de fazer login.');
    } catch (error) {
      setApiError(error.message);
      console.error('Erro no registro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-shell auth-shell-register">
      <section className="auth-panel auth-panel-brand d-none d-lg-flex">
        <Link to="/" className="auth-logo-link">
          <img src="/logo-casa.jpg" alt="Boa Estadia" height="44" />
        </Link>

        <h1>Crie sua conta e entre no mercado com confianca</h1>
        <p>
          O seu perfil permite arrendar, gerir anuncios e acompanhar solicitacoes com uma experiencia moderna.
        </p>

        <div className="auth-benefits">
          <span><FaUsers /> Fluxo pensado para inquilino e proprietario</span>
          <span><FaClipboardCheck /> Processo de cadastro simples e guiado</span>
          <span><FaRocket /> Inicio rapido em menos de 2 minutos</span>
        </div>
      </section>

      <section className="auth-panel auth-panel-form">
        <div className="auth-form-wrap auth-form-wide">
          <div className="text-center mb-4">
            <Link to="/" className="d-inline-block d-lg-none mb-3">
              <img src="/logo-casa.jpg" alt="Boa Estadia" height="38" />
            </Link>
            <h2 className="auth-title">Criar conta</h2>
            <p className="auth-subtitle">Preencha os dados para comecar a usar a plataforma.</p>
          </div>

          {apiError && (
            <div className="alert alert-danger" role="alert">
              {apiError}
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
              <FaCheckCircle /> {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="name" className="form-label">Nome completo</label>
                <input
                  type="text"
                  className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`}
                  id="name"
                  placeholder="Digite seu nome"
                  {...register('name')}
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
              </div>

              <div className="col-md-6">
                <label htmlFor="phone" className="form-label">Telefone</label>
                <input
                  type="tel"
                  className={`form-control form-control-lg ${errors.phone ? 'is-invalid' : ''}`}
                  id="phone"
                  placeholder="+244 XXX XXX XXX"
                  {...register('phone')}
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
              </div>

              <div className="col-12">
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

              <div className="col-md-6">
                <label htmlFor="userType" className="form-label">Perfil de uso</label>
                <select
                  className={`form-select form-select-lg ${errors.userType ? 'is-invalid' : ''}`}
                  id="userType"
                  {...register('userType')}
                >
                  <option value="">Selecione...</option>
                  <option value="tenant">Inquilino(a)</option>
                  <option value="landlord">Proprietario(a)</option>
                </select>
                {errors.userType && <div className="invalid-feedback">{errors.userType.message}</div>}
              </div>

              <div className="col-md-6">
                <label htmlFor="password" className="form-label">Senha</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    placeholder="Minimo de 6 caracteres"
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

              <div className="col-12">
                <label htmlFor="confirmPassword" className="form-label">Confirmar senha</label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    placeholder="Repita a senha"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                  </button>
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
                </div>
              </div>
            </div>

            <div className="mt-3 mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className={`form-check-input ${errors.terms ? 'is-invalid' : ''}`}
                  id="terms"
                  {...register('terms')}
                />
                <label className="form-check-label" htmlFor="terms">
                  Li e aceito os <Link to="/termos" className="fw-semibold text-decoration-none">termos de uso</Link>
                </label>
                {errors.terms && <div className="invalid-feedback">{errors.terms.message}</div>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100 mb-3" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </button>

            <div className="text-center small text-muted">
              Ja possui conta?{' '}
              <Link to="/login" className="text-decoration-none fw-semibold">
                Entrar
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Register;
