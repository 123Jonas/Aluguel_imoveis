import { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaHome, FaBuilding, FaStore, FaTimesCircle, FaSlidersH } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PropertyCard from '../../components/PropertyCard';
import { apiUrl } from '../../config';

const TYPE_META = {
  apartment: { label: 'Apartamento', icon: FaBuilding },
  house:     { label: 'Casa',        icon: FaHome },
  commercial:{ label: 'Comercial',   icon: FaStore }
};

const Search = () => {
  const navigate = useNavigate();
  const token    = localStorage.getItem('token');
  const user     = JSON.parse(localStorage.getItem('user') || '{}');

  const [properties, setProperties]     = useState([]);
  const [favorites,  setFavorites]      = useState(new Set());
  const [loading,    setLoading]        = useState(true);
  const [showFilters,setShowFilters]    = useState(true);
  const [filters,    setFilters]        = useState({
    type: 'all', minPrice: '', maxPrice: '', location: '', bedrooms: ''
  });

  useEffect(() => {
    fetchProperties();
    if (token) fetchFavorites();
  }, []);

  const fetchProperties = async () => {
    try {
      const res  = await fetch(`${apiUrl}/api/properties/available`);
      const data = await res.json();
      setProperties(data?.data?.properties || []);
    } catch {
      toast.error('Erro ao carregar imóveis.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res  = await fetch(`${apiUrl}/api/tenant/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const ids  = (data?.data?.favorites || []).map(p => p._id || p);
      setFavorites(new Set(ids));
    } catch { /* silent */ }
  };

  const handleToggleFavorite = async (propertyId, isFav) => {
    if (!token) { toast.info('Inicie sessão para guardar favoritos.'); return; }
    try {
      const method = isFav ? 'DELETE' : 'POST';
      await fetch(`${apiUrl}/api/tenant/favorites/${propertyId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(prev => {
        const next = new Set(prev);
        isFav ? next.delete(propertyId) : next.add(propertyId);
        return next;
      });
    } catch {
      toast.error('Erro ao actualizar favoritos.');
    }
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () =>
    setFilters({ type: 'all', minPrice: '', maxPrice: '', location: '', bedrooms: '' });

  const filtered = useMemo(() => {
    const min  = Number(filters.minPrice);
    const max  = Number(filters.maxPrice);
    const loc  = filters.location.trim().toLowerCase();
    const beds = Number(filters.bedrooms);
    return properties.filter(p => (
      (filters.type === 'all' || p.type?.toLowerCase() === filters.type) &&
      (!filters.minPrice    || Number(p.price) >= min) &&
      (!filters.maxPrice    || Number(p.price) <= max) &&
      (!loc                 || (p.location || '').toLowerCase().includes(loc)) &&
      (!filters.bedrooms    || Number(p.bedrooms) >= beds)
    ));
  }, [properties, filters]);

  const hasActiveFilters =
    filters.type !== 'all' || filters.minPrice || filters.maxPrice ||
    filters.location || filters.bedrooms;

  return (
    <div style={{ animation: 'fade-up .35s ease' }}>

      {/* ── Page header ── */}
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h1 className="mb-1">Buscar Imóveis</h1>
          <p className="text-muted">
            Explore {properties.length} imóvel{properties.length !== 1 ? 'is' : ''} disponíve{properties.length !== 1 ? 'is' : 'l'}
          </p>
        </div>
        <Button
          variant={showFilters ? 'primary' : 'outline-secondary'}
          size="sm"
          onClick={() => setShowFilters(v => !v)}
        >
          <FaSlidersH className="me-2" />
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>
      </div>

      {/* ── Filters ── */}
      {showFilters && (
        <div className="card mb-4 p-3 border-0" style={{ boxShadow: 'var(--shadow-soft)', borderRadius: 'var(--radius-lg)' }}>
          <Row className="g-3 mb-3">
            <Col sm={6} lg={3}>
              <Form.Group>
                <Form.Label>Tipo de imóvel</Form.Label>
                <Form.Select name="type" value={filters.type} onChange={handleFilterChange}>
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
                <Form.Select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange}>
                  <option value="">Qualquer</option>
                  {[1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{n}+ quarto{n>1?'s':''}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col sm={6} lg={2}>
              <Form.Group>
                <Form.Label>Preço mín. (KZ)</Form.Label>
                <Form.Control
                  type="number" name="minPrice" value={filters.minPrice}
                  onChange={handleFilterChange} placeholder="0" min="0"
                />
              </Form.Group>
            </Col>
            <Col sm={6} lg={2}>
              <Form.Group>
                <Form.Label>Preço máx. (KZ)</Form.Label>
                <Form.Control
                  type="number" name="maxPrice" value={filters.maxPrice}
                  onChange={handleFilterChange} placeholder="Sem limite" min="0"
                />
              </Form.Group>
            </Col>
            <Col sm={12} lg={3}>
              <Form.Group>
                <Form.Label>Localização</Form.Label>
                <div className="input-group">
                  <span className="input-group-text border-end-0 bg-white">
                    <FaSearch size={12} className="text-muted" />
                  </span>
                  <Form.Control
                    style={{ borderLeft: 'none' }}
                    type="text" name="location" value={filters.location}
                    onChange={handleFilterChange} placeholder="Cidade ou bairro"
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* type pills */}
          <div className="d-flex gap-2 flex-wrap mb-3">
            <button
              className={`home-pill${filters.type === 'all' ? ' active' : ''}`}
              onClick={() => setFilters(p => ({ ...p, type: 'all' }))}
            >
              Todos
            </button>
            {Object.entries(TYPE_META).map(([key, meta]) => {
              const Icon = meta.icon;
              return (
                <button
                  key={key}
                  className={`home-pill${filters.type === key ? ' active' : ''}`}
                  onClick={() => setFilters(p => ({ ...p, type: key }))}
                >
                  <Icon size={11} className="me-1" />{meta.label}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <div>
              <Button variant="link" size="sm" className="p-0 text-muted" onClick={clearFilters}>
                <FaTimesCircle className="me-1" /> Limpar todos os filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Results count ── */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <p className="mb-0 text-muted" style={{ fontSize: '0.88rem' }}>
          <strong className="text-dark">{filtered.length}</strong> resultado{filtered.length !== 1 ? 's' : ''}
          {hasActiveFilters && ' com os filtros aplicados'}
        </p>
      </div>

      {/* ── Results ── */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">A carregar imóveis...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <FaHome size={48} style={{ opacity: .2, color: '#64748b' }} />
          <h5 className="mt-3 text-muted">Nenhum imóvel encontrado</h5>
          <p className="text-muted mb-3" style={{ fontSize: '0.88rem' }}>
            {hasActiveFilters
              ? 'Nenhum imóvel corresponde aos filtros actuais. Tente alargar os critérios.'
              : 'Não existem imóveis disponíveis neste momento.'}
          </p>
          {hasActiveFilters && (
            <Button variant="outline-primary" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        <Row className="g-4">
          {filtered.map(property => (
            <Col key={property._id} sm={6} xl={4}>
              <PropertyCard
                property={property}
                onViewDetails={id => navigate(`/properties/${id}`)}
                isFavorite={favorites.has(property._id)}
                onToggleFavorite={handleToggleFavorite}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Search;
