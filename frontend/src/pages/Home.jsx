import { useState, useEffect, useMemo, useRef } from 'react';
import { Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import PropertyCard from '../components/PropertyCard';
import {
  FaSearch, FaHome, FaBuilding, FaStore,
  FaMapMarkerAlt, FaCheckCircle, FaArrowRight,
  FaTimesCircle, FaComments, FaKey, FaStar,
  FaShieldAlt, FaHandshake
} from 'react-icons/fa';
import { apiUrl } from '../config';

const TYPE_META = {
  apartment: { label: 'Apartamento', icon: FaBuilding },
  house:     { label: 'Casa',        icon: FaHome },
  commercial:{ label: 'Comercial',   icon: FaStore }
};

const STEPS = [
  {
    icon: FaSearch,
    color: '#2563eb',
    bg: '#eff6ff',
    title: 'Pesquise',
    desc: 'Explore centenas de imóveis verificados por localização, preço e tipologia.'
  },
  {
    icon: FaComments,
    color: '#0d9488',
    bg: '#f0fdfa',
    title: 'Contacte',
    desc: 'Fale directamente com o proprietário pelo chat integrado, sem intermediários.'
  },
  {
    icon: FaKey,
    color: '#7c3aed',
    bg: '#f5f3ff',
    title: 'Alugue',
    desc: 'Solicite o arrendamento e acompanhe todo o processo numa só plataforma.'
  }
];

const GALLERY = ['/casa-2.jpg', '/casa-3.jpg', '/casa-4.jpg', '/casa-5.jpg', '/casa-6.jpg'];

const Home = () => {
  const navigate = useNavigate();
  const resultsRef = useRef(null);

  const [properties,  setProperties]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [heroSearch,  setHeroSearch]  = useState({ location: '', type: 'all' });
  const [filters,     setFilters]     = useState({ type: 'all', minPrice: '', maxPrice: '', location: '', bedrooms: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchProperties(); }, []);

  const fetchProperties = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/properties/available`);
      setProperties(data?.data?.properties || []);
    } catch { /* silent — mostrar empty state */ }
    finally { setLoading(false); }
  };

  const handleHeroSearch = e => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, location: heroSearch.location, type: heroSearch.type }));
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearFilters = () => setFilters({ type: 'all', minPrice: '', maxPrice: '', location: '', bedrooms: '' });

  const filtered = useMemo(() => {
    const min  = Number(filters.minPrice);
    const max  = Number(filters.maxPrice);
    const loc  = filters.location.trim().toLowerCase();
    const beds = Number(filters.bedrooms);
    return properties.filter(p => (
      (filters.type === 'all'  || p.type?.toLowerCase() === filters.type) &&
      (!filters.minPrice       || Number(p.price) >= min) &&
      (!filters.maxPrice       || Number(p.price) <= max) &&
      (!loc                    || (p.location || '').toLowerCase().includes(loc)) &&
      (!filters.bedrooms       || Number(p.bedrooms) >= beds)
    ));
  }, [properties, filters]);

  const stats = useMemo(() => {
    const t = { apartment: 0, house: 0, commercial: 0 };
    properties.forEach(p => { if (t[p.type] !== undefined) t[p.type]++; });
    return { total: properties.length, ...t };
  }, [properties]);

  const hasFilters = filters.type !== 'all' || filters.minPrice || filters.maxPrice || filters.location || filters.bedrooms;

  return (
    <div className="home-page">

      {/* ════════════════ HERO ════════════════ */}
      <section className="home-hero">
        <div className="home-hero-bg" />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="home-hero-panel">
            <div className="home-kicker">
              <FaMapMarkerAlt size={10} /> Angola · Plataforma de Arrendamento
            </div>

            <h1 className="home-title">
              Encontre o imóvel perfeito<br />
              <span style={{ color: '#7dd3fc' }}>para chamar de lar</span>
            </h1>

            <p className="home-subtitle">
              Anúncios verificados com fotos reais, preços transparentes e contacto
              directo com o proprietário — tudo num só lugar.
            </p>

            {/* Hero search bar */}
            <form className="hero-search-bar" onSubmit={handleHeroSearch}>
              <div className="hero-search-field">
                <FaMapMarkerAlt className="hero-search-icon" />
                <input
                  className="hero-search-input"
                  type="text"
                  placeholder="Cidade ou bairro..."
                  value={heroSearch.location}
                  onChange={e => setHeroSearch(p => ({ ...p, location: e.target.value }))}
                />
              </div>
              <div className="hero-search-divider" />
              <div className="hero-search-field hero-search-field--select">
                <FaHome className="hero-search-icon" />
                <select
                  className="hero-search-select"
                  value={heroSearch.type}
                  onChange={e => setHeroSearch(p => ({ ...p, type: e.target.value }))}
                >
                  <option value="all">Todos os tipos</option>
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="commercial">Comercial</option>
                </select>
              </div>
              <button type="submit" className="hero-search-btn">
                <FaSearch size={15} />
                <span>Pesquisar</span>
              </button>
            </form>

            {/* Trust badges */}
            <div className="home-proof">
              <span><FaCheckCircle size={13} /> Anúncios verificados</span>
              <span><FaShieldAlt   size={13} /> Processo seguro</span>
              <span><FaStar        size={13} /> Avaliações reais</span>
              <span><FaHandshake   size={13} /> Sem comissões ocultas</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ STATS ════════════════ */}
      <div className="container">
        <div className="home-stats">
          {[
            { label: 'Imóveis disponíveis', value: stats.total,      icon: '🏘️' },
            { label: 'Apartamentos',        value: stats.apartment,   icon: '🏢' },
            { label: 'Casas',               value: stats.house,       icon: '🏠' },
            { label: 'Espaços comerciais',  value: stats.commercial,  icon: '🏪' },
          ].map(s => (
            <div key={s.label} className="home-stat-card">
              <div className="home-stat-emoji">{s.icon}</div>
              <strong className="home-stat-value">{s.value}</strong>
              <span className="home-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ GALLERY STRIP ════════════════ */}
      <div className="container py-4">
        <div className="home-gallery">
          {GALLERY.map((src, i) => (
            <div key={i} className="home-gallery-item">
              <img src={src} alt={`Imóvel ${i + 2}`} />
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="home-how-section" id="como-funciona">
        <div className="container">
          <div className="text-center mb-5">
            <span className="home-section-kicker">Simples e rápido</span>
            <h2 className="home-section-title">Como funciona?</h2>
            <p className="home-section-sub">
              Do primeiro clique às chaves na mão em três passos simples.
            </p>
          </div>
          <div className="home-steps">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="home-step">
                  <div className="home-step-num">{i + 1}</div>
                  <div className="home-step-icon-wrap" style={{ background: s.bg }}>
                    <Icon size={28} color={s.color} />
                  </div>
                  <h4 className="home-step-title">{s.title}</h4>
                  <p className="home-step-desc">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ PROPERTIES ════════════════ */}
      <div className="container py-4 py-md-5" ref={resultsRef}>

        {/* Results header + filter toggle */}
        <div className="home-results-head mb-3">
          <div>
            <h2>Imóveis em destaque</h2>
            <p>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              {hasFilters && ' com os filtros aplicados'}
            </p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            {hasFilters && (
              <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
                <FaTimesCircle className="me-1" /> Limpar
              </button>
            )}
            <button
              className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setShowFilters(v => !v)}
            >
              Filtros {showFilters ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="home-search-panel mb-4">
            <Row className="g-3 mb-3">
              <Col sm={6} lg={3}>
                <Form.Group>
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
                    <option value="all">Todos os tipos</option>
                    <option value="apartment">Apartamento</option>
                    <option value="house">Casa</option>
                    <option value="commercial">Comercial</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={6} lg={2}>
                <Form.Group>
                  <Form.Label>Quartos (mín.)</Form.Label>
                  <Form.Select value={filters.bedrooms} onChange={e => setFilters(p => ({ ...p, bedrooms: e.target.value }))}>
                    <option value="">Qualquer</option>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={6} lg={2}>
                <Form.Group>
                  <Form.Label>Preço mín. (KZ)</Form.Label>
                  <Form.Control type="number" placeholder="0" value={filters.minPrice}
                    onChange={e => setFilters(p => ({ ...p, minPrice: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col sm={6} lg={2}>
                <Form.Group>
                  <Form.Label>Preço máx. (KZ)</Form.Label>
                  <Form.Control type="number" placeholder="Sem limite" value={filters.maxPrice}
                    onChange={e => setFilters(p => ({ ...p, maxPrice: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col sm={12} lg={3}>
                <Form.Group>
                  <Form.Label>Localização</Form.Label>
                  <Form.Control type="text" placeholder="Cidade ou bairro" value={filters.location}
                    onChange={e => setFilters(p => ({ ...p, location: e.target.value }))} />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex gap-2 flex-wrap">
              {Object.entries(TYPE_META).map(([key, meta]) => {
                const Icon = meta.icon;
                return (
                  <button key={key}
                    className={`home-pill${filters.type === key ? ' active' : ''}`}
                    onClick={() => setFilters(p => ({ ...p, type: key }))}
                  >
                    <Icon size={11} className="me-1" />{meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">A carregar imóveis...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="home-empty">
            <div className="home-empty-icon">🏠</div>
            <h5>Nenhum imóvel encontrado</h5>
            <p>Tente alargar os critérios de pesquisa.</p>
            {hasFilters && (
              <Button variant="outline-primary" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <Row className="g-4">
            {filtered.map(property => (
              <Col key={property._id} md={6} xl={4}>
                <PropertyCard
                  property={property}
                  onViewDetails={id => navigate(`/properties/${id}`)}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* ════════════════ LANDLORD CTA ════════════════ */}
      <section className="home-cta-section">
        <div className="container">
          <div className="home-cta-card">
            <div className="home-cta-text">
              <h2>Tem um imóvel para arrendar?</h2>
              <p>
                Publique o seu anúncio gratuitamente e chegue a milhares de inquilinos
                em todo o país. Gestão completa numa só plataforma.
              </p>
              <div className="d-flex gap-3 flex-wrap mt-3">
                <span><FaCheckCircle /> Publicação gratuita</span>
                <span><FaCheckCircle /> Gestão de visitas</span>
                <span><FaCheckCircle /> Chat com candidatos</span>
              </div>
            </div>
            <div className="home-cta-actions">
              <button className="home-cta-btn" onClick={() => navigate('/cadastro')}>
                Anunciar imóvel <FaArrowRight size={14} className="ms-2" />
              </button>
              <button className="home-cta-btn-ghost" onClick={() => navigate('/login')}>
                Já tenho conta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="home-footer">
        <div className="container">
          <div className="home-footer-inner">
            <div className="d-flex align-items-center gap-2">
              <img src="/logo-casa.jpg" alt="Boa Estadia" height="28" style={{ borderRadius: 6 }} />
              <span className="fw-bold" style={{ fontSize: '.95rem' }}>Boa Estadia</span>
            </div>
            <p className="mb-0 text-muted" style={{ fontSize: '.82rem' }}>
              © {new Date().getFullYear()} Boa Estadia · Angola · Todos os direitos reservados
            </p>
            <div className="d-flex gap-3" style={{ fontSize: '.82rem' }}>
              <Link to="/login"   className="text-muted text-decoration-none">Entrar</Link>
              <Link to="/cadastro" className="text-muted text-decoration-none">Registar</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
