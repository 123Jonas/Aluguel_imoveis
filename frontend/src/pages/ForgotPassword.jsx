import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/users/forgot-password', { email });
      setSuccess('Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
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
                    <h1 className="h3 mb-3">Recuperar Senha</h1>
                    <p className="text-muted">Digite seu email para receber as instruções de recuperação de senha.</p>
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="alert alert-success" role="alert">
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 mb-4"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Enviando...
                        </>
                      ) : (
                        'Enviar Email de Recuperação'
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none"
                        onClick={() => navigate('/login')}
                        disabled={loading}
                      >
                        Voltar para o Login
                      </button>
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

export default ForgotPassword; 