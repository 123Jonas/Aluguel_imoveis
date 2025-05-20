import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const API_URL = 'http://localhost:5000/api';

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Digite um email válido')
    .required('Email é obrigatório'),
});

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setApiError('');
      setSuccessMessage('');
      
      const response = await fetch(`${API_URL}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao processar solicitação');
      }

      setSuccessMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');

    } catch (error) {
      if (!window.navigator.onLine) {
        setApiError('Erro de conexão. Verifique sua internet.');
      } else if (error.message === 'Failed to fetch') {
        setApiError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      } else if (error.message.includes('Credenciais de email não configuradas')) {
        setApiError('O sistema de email não está configurado. Por favor, contate o administrador.');
      } else {
        setApiError(error.message);
      }
      console.error('Erro na recuperação de senha:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                  <h1 className="h3 mb-3">Recuperar Senha</h1>
                  <p className="text-muted">Digite seu email para receber as instruções de recuperação</p>
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

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100 mb-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Enviando...
                      </>
                    ) : (
                      'Enviar instruções'
                    )}
                  </button>

                  <div className="text-center">
                    <p className="mb-0">
                      Lembrou sua senha?{' '}
                      <Link to="/login" className="text-primary text-decoration-none">
                        Voltar ao login
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
  );
};

export default ForgotPassword; 