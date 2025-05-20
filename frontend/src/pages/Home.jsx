import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (location.trim()) {
      navigate(`/anuncios?location=${encodeURIComponent(location)}`);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero position-relative">
        <div className="hero-overlay"></div>
        <div className="container position-relative min-vh-100 d-flex flex-column justify-content-center">
          <div className="row">
            <div className="col-lg-6 text-white">
              <h1 className="display-4 fw-bold mb-4">Alugue seu imóvel no Bié com segurança</h1>
              <p className="lead mb-5">Encontre apartamentos e casas para alugar em todo o país. Processo 100% digital, com garantia e segurança.</p>
              
              <div className="search-container bg-white p-4 rounded-4 shadow-lg">
                <h2 className="h5 text-dark mb-4">Onde você quer morar?</h2>
                <form onSubmit={handleSearch} className="d-flex flex-column gap-3">
                  <div className="input-group">
                    <span className="input-group-text border-0 bg-light">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control form-control-lg border-0 bg-light"
                      placeholder="Digite um bairro ou cidade"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100">
                    Buscar imóveis
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center">
                <i className="bi bi-shield-check fs-1 text-primary mb-3"></i>
                <h3 className="h5">Aluguel Garantido</h3>
                <p className="text-muted">Garantimos o pagamento do aluguel em dia para o proprietário</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <i className="bi bi-file-earmark-text fs-1 text-primary mb-3"></i>
                <h3 className="h5">Processo 100% Digital</h3>
                <p className="text-muted">Assinatura digital de contrato e envio de documentos online</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <i className="bi bi-house-heart fs-1 text-primary mb-3"></i>
                <h3 className="h5">Visitas Agendadas</h3>
                <p className="text-muted">Agende visitas aos imóveis com nossos consultores</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Neighborhoods */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">Bairros mais buscados</h2>
          <div className="row g-4">
            {['Talatona', 'Miramar', 'Maianga', 'Kilamba'].map((neighborhood) => (
              <div key={neighborhood} className="col-md-3">
                <div className="card neighborhood-card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h3 className="h6 mb-3">{neighborhood}</h3>
                    <p className="small text-muted mb-3">A partir de AOA 150.000</p>
                    <button className="btn btn-outline-primary btn-sm">Ver imóveis</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2>Quer anunciar seu imóvel?</h2>
              <p className="lead mb-0">Anuncie seu imóvel com a gente e tenha acesso a milhares de inquilinos qualificados.</p>
            </div>
            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <button className="btn btn-outline-light btn-lg">Anunciar agora</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home; 