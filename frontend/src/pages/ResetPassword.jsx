import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password !== passwordConfirm) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      await axios.patch(`http://localhost:5000/api/users/reset-password/${token}`, {
        password,
        passwordConfirm
      });
      setSuccess('Senha redefinida com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao redefinir senha');
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
                    <h1 className="h3 mb-3">Redefinir Senha</h1>
                    <p className="text-muted">Digite sua nova senha abaixo.</p>
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
                      <label htmlFor="password" className="form-label">Nova Senha</label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="password"
                        placeholder="Digite sua nova senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="passwordConfirm" className="form-label">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="passwordConfirm"
                        placeholder="Confirme sua nova senha"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
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
                          Redefinindo...
                        </>
                      ) : (
                        'Redefinir Senha'
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

export default ResetPassword; 