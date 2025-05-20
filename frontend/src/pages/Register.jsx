import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Navbar from '../components/Navbar';

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: yup
    .string()
    .email('Digite um email válido')
    .required('Email é obrigatório'),
  phone: yup
    .string()
    .required('Telefone é obrigatório')
    .matches(/^\+?[1-9]\d{1,14}$/, 'Digite um número de telefone válido'),
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'As senhas devem coincidir')
    .required('Confirmação de senha é obrigatória'),
  userType: yup
    .string()
    .oneOf(['tenant', 'landlord'], 'Selecione um tipo de usuário')
    .required('Tipo de usuário é obrigatório'),
  terms: yup
    .boolean()
    .oneOf([true], 'Você deve aceitar os termos de uso')
});

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setApiError('');
      setSuccessMessage('');
      
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          userType: data.userType
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao criar conta');
      }

      // Mostrar mensagem de sucesso
      setSuccessMessage('Usuário criado com sucesso! Redirecionando para a página de login...');
      
      // Esperar 2 segundos antes de redirecionar
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setApiError(error.message);
      console.error('Erro no registro:', error);
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
            <div className="col-12 col-md-8 col-lg-6">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-5">
                  <div className="text-center mb-5">
                    <Link to="/" className="d-inline-block mb-4">
                      <img src="/logo.png" alt="Boa Estadia" height="40" />
                    </Link>
                    <h1 className="h3 mb-3">Criar uma conta</h1>
                    <p className="text-muted">Preencha seus dados para começar</p>
                  </div>

                  {apiError && (
                    <div className="alert alert-danger" role="alert">
                      {apiError}
                    </div>
                  )}

                  {successMessage && (
                    <div className="alert alert-success" role="alert">
                      {successMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                      <label htmlFor="name" className="form-label">Nome completo</label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`}
                        id="name"
                        placeholder="Digite seu nome"
                        {...register('name')}
                      />
                      {errors.name && (
                        <div className="invalid-feedback">{errors.name.message}</div>
                      )}
                    </div>

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
                      <label htmlFor="phone" className="form-label">Telefone</label>
                      <input
                        type="tel"
                        className={`form-control form-control-lg ${errors.phone ? 'is-invalid' : ''}`}
                        id="phone"
                        placeholder="+244 XXX XXX XXX"
                        {...register('phone')}
                      />
                      {errors.phone && (
                        <div className="invalid-feedback">{errors.phone.message}</div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="userType" className="form-label">Você é um(a):</label>
                      <select
                        className={`form-select form-select-lg ${errors.userType ? 'is-invalid' : ''}`}
                        id="userType"
                        {...register('userType')}
                      >
                        <option value="">Selecione...</option>
                        <option value="tenant">Inquilino(a)</option>
                        <option value="landlord">Proprietário(a)</option>
                      </select>
                      {errors.userType && (
                        <div className="invalid-feedback">{errors.userType.message}</div>
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

                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label">Confirmar senha</label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          id="confirmPassword"
                          placeholder="Confirme sua senha"
                          {...register('confirmPassword')}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                        </button>
                        {errors.confirmPassword && (
                          <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className={`form-check-input ${errors.terms ? 'is-invalid' : ''}`}
                          id="terms"
                          {...register('terms')}
                        />
                        <label className="form-check-label" htmlFor="terms">
                          Eu li e aceito os{' '}
                          <Link to="/termos" className="text-primary">
                            termos de uso
                          </Link>
                        </label>
                        {errors.terms && (
                          <div className="invalid-feedback">{errors.terms.message}</div>
                        )}
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg w-100 mb-4"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Criando conta...
                        </>
                      ) : (
                        'Criar conta'
                      )}
                    </button>

                    <div className="text-center">
                      <p className="mb-0">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="text-primary text-decoration-none">
                          Entrar
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

export default Register; 