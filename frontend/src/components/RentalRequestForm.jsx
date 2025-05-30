import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';

const RentalRequestForm = ({ property }) => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error('Por favor, selecione as datas de início e fim do aluguel');
      return;
    }

    if (startDate >= endDate) {
      toast.error('A data de início deve ser anterior à data de término');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/rental-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          propertyId: property._id,
          startDate,
          endDate,
          message
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar solicitação');
      }

      toast.success('Solicitação enviada com sucesso!');
      navigate('/tenant/requests');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-4">Solicitar Aluguel</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Data de Início</label>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              className="form-control"
              placeholderText="Selecione a data de início"
              dateFormat="dd/MM/yyyy"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Data de Término</label>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="form-control"
              placeholderText="Selecione a data de término"
              dateFormat="dd/MM/yyyy"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mensagem (opcional)</label>
            <textarea
              className="form-control"
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Adicione uma mensagem para o proprietário..."
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enviando...
              </>
            ) : (
              'Enviar Solicitação'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RentalRequestForm; 