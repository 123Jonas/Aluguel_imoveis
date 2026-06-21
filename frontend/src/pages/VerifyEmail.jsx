import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../config';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/users/verify-email/${token}`);
        setMessage(res.data.message);
        setStatus('success');
      } catch (err) {
        setMessage(err.response?.data?.message || 'Token inválido ou expirado.');
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm p-5 text-center" style={{ maxWidth: 480 }}>
        {status === 'loading' && (
          <>
            <div className="spinner-border text-primary mb-3" role="status" />
            <p className="text-muted">A verificar o seu email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-success mb-3" style={{ fontSize: 56 }}>
              <i className="bi bi-check-circle-fill" />
            </div>
            <h4 className="mb-2">Email verificado!</h4>
            <p className="text-muted mb-4">{message}</p>
            <Link to="/login" className="btn btn-primary">
              Ir para o Login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-danger mb-3" style={{ fontSize: 56 }}>
              <i className="bi bi-x-circle-fill" />
            </div>
            <h4 className="mb-2">Verificação falhou</h4>
            <p className="text-muted mb-4">{message}</p>
            <Link to="/login" className="btn btn-outline-primary me-2">
              Ir para o Login
            </Link>
            <Link to="/resend-verification" className="btn btn-primary">
              Reenviar Email
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
