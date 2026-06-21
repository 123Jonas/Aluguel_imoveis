import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { apiUrl } from '../config';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const StarRating = ({ rating, onSelect, readonly = false }) => (
  <div className="d-flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <span
        key={star}
        style={{ cursor: readonly ? 'default' : 'pointer', fontSize: 22, color: star <= rating ? '#f59e0b' : '#d1d5db' }}
        onClick={() => !readonly && onSelect && onSelect(star)}
      >
        {star <= rating ? <FaStar /> : <FaRegStar />}
      </span>
    ))}
  </div>
);

const PropertyReviews = ({ propertyId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const isTenant = user.userType === 'tenant';

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/properties/${propertyId}/reviews`);
      const data = await res.json();
      setReviews(data.data.reviews);
    } catch { toast.error('Erro ao carregar avaliações'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [propertyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/properties/${propertyId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Avaliação enviada!');
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Remover esta avaliação?')) return;
    try {
      const res = await fetch(`${apiUrl}/api/properties/${propertyId}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao remover avaliação');
      toast.info('Avaliação removida');
      fetchReviews();
    } catch (err) { toast.error(err.message); }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="mt-5">
      <h5 className="mb-3">
        Avaliações
        {avgRating && (
          <span className="ms-2 text-warning fw-normal fs-6">
            <FaStar /> {avgRating} ({reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''})
          </span>
        )}
      </h5>

      {loading ? (
        <div className="spinner-border spinner-border-sm" />
      ) : reviews.length === 0 ? (
        <p className="text-muted">Ainda sem avaliações.</p>
      ) : (
        <div className="list-group mb-4">
          {reviews.map(r => (
            <div key={r._id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{r.tenant?.name}</strong>
                  <div><StarRating rating={r.rating} readonly /></div>
                  {r.comment && <p className="mb-0 mt-1 small">{r.comment}</p>}
                  <small className="text-muted">
                    {format(new Date(r.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </small>
                </div>
                {r.tenant?._id === user._id && (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r._id)}>
                    Remover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isTenant && token && (
        <div className="card p-3">
          <h6 className="mb-3">Deixar uma avaliação</h6>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nota</label>
              <div><StarRating rating={rating} onSelect={setRating} /></div>
            </div>
            <div className="mb-3">
              <label className="form-label">Comentário (opcional)</label>
              <textarea
                className="form-control"
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                maxLength={500}
                placeholder="Partilhe a sua experiência..."
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner-border spinner-border-sm me-2" />A enviar...</> : 'Enviar avaliação'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PropertyReviews;
