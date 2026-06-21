import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../config';

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await axios.post(`${apiUrl}/api/users/resend-verification`, { email });
      setMessage(res.data.message);
      setStatus('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erro ao reenviar email.');
      setStatus('error');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm p-5" style={{ maxWidth: 420, width: '100%' }}>
        <h4 className="mb-1">Reenviar verificação</h4>
        <p className="text-muted mb-4">Digite o email cadastrado para receber um novo link de verificação.</p>

        {status === 'success' && (
          <div className="alert alert-success">{message}</div>
        )}
        {status === 'error' && (
          <div className="alert alert-danger">{message}</div>
        )}

        {status !== 'success' && (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={status === 'loading'}>
              {status === 'loading' ? (
                <><span className="spinner-border spinner-border-sm me-2" />A enviar...</>
              ) : 'Reenviar Email'}
            </button>
          </form>
        )}

        <div className="text-center mt-3">
          <Link to="/login" className="text-decoration-none small">Voltar ao login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;
