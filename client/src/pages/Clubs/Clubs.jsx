import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Badge, Button, Spinner } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaUsers, FaArrowRight, FaFilter } from 'react-icons/fa';
import api from '../../utils/api';

const Clubs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories] = useState(['All', 'technical', 'cultural', 'sports', 'literary', 'social', 'other']);
  
  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';

  const fetchClubs = async () => {
    setLoading(true);
    try {
      let query = '/clubs?limit=50';
      if (currentCategory !== 'All') query += `&category=${currentCategory}`;
      if (currentSearch) query += `&search=${currentSearch}`;
      
      const res = await api.get(query);
      setClubs(res.data.clubs);
    } catch (error) {
      console.error('Failed to fetch clubs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [currentCategory, currentSearch]);

  const handleSearch = (e) => {
    const value = e.target.value;
    if (value) searchParams.set('search', value);
    else searchParams.delete('search');
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (cat) => {
    if (cat === 'All') searchParams.delete('category');
    else searchParams.set('category', cat);
    setSearchParams(searchParams);
  };

  const getCategoryTheme = (category) => {
    const themes = { technical: 'info', cultural: 'secondary', sports: 'success', literary: 'warning', social: 'primary', other: 'light' };
    return themes[category] || 'primary';
  };

  return (
    <Container className="py-5 animate-fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
        <div>
          <h1 className="fw-bold display-5 mb-2">Explore Clubs</h1>
          <p className="text-secondary fs-5 mb-0">Join communities that share your passion and interests.</p>
        </div>
      </div>

      <Row className="mb-5 g-3">
        <Col md={6} lg={4}>
          <div className="position-relative">
            <FaSearch className="position-absolute top-50 translate-middle-y text-secondary ms-3" />
            <Form.Control
              type="text"
              placeholder="Search clubs by name..."
              value={currentSearch}
              onChange={handleSearch}
              className="ps-5 bg-dark border-secondary bg-opacity-50 text-light py-2 rounded-pill shadow-none"
            />
          </div>
        </Col>
        <Col md={6} lg={8} className="d-flex align-items-center gap-2 overflow-auto pb-2 custom-scrollbar">
          <FaFilter className="text-secondary flex-shrink-0 ms-md-3" />
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={currentCategory === cat ? 'primary' : 'outline-secondary'}
              onClick={() => handleCategoryChange(cat)}
              className="rounded-pill text-capitalize px-3 py-1 bg-opacity-25 border-opacity-50 flex-shrink-0"
              style={{ padding: '0.4rem 1rem' }}
            >
              {cat}
            </Button>
          ))}
        </Col>
      </Row>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="grow" variant="primary" />
        </div>
      ) : clubs.length === 0 ? (
        <div className="glass-panel text-center py-5 px-3 rounded-4 shadow-sm">
          <FaUsers size={48} className="text-secondary opacity-50 mb-3" />
          <h3 className="fw-bold">No Clubs Found</h3>
          <p className="text-secondary text-center mb-0 mt-2">Try adjusting your search criteria or category filter.</p>
        </div>
      ) : (
        <Row className="g-4">
          <AnimatePresence>
            {clubs.map((club, idx) => (
              <Col lg={4} md={6} key={club._id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="h-100"
                >
                  <Card className="glass-card text-light h-100 border-0 bg-transparent text-center p-4 align-items-center position-relative overflow-hidden">
                    <Badge bg={getCategoryTheme(club.category)} className="position-absolute top-0 end-0 m-3 px-3 py-2 text-uppercase letter-spacing-1 shadow-sm fs-7 rounded-pill">
                      {club.category}
                    </Badge>

                    <div className="mb-4 mt-3 rounded-circle d-flex align-items-center justify-content-center bg-dark" style={{ width: '100px', height: '100px', border: '2px solid var(--primary-color)' }}>
                      {club.logo ? (
                        <img src={club.logo.startsWith('http') ? club.logo : `http://localhost:5001${club.logo}`} alt={club.name} className="img-fluid rounded-circle w-100 h-100 object-fit-cover" />
                      ) : (
                        <FaUsers size={40} className="text-primary opacity-75" />
                      )}
                    </div>
                    
                    <h4 className="fw-bold mb-2">{club.name}</h4>
                    <p className="text-secondary small mb-4 line-clamp-3 px-2">{club.description}</p>
                    
                    <div className="mt-auto w-100">
                      <div className="d-flex justify-content-center align-items-center text-secondary mb-4 small bg-dark bg-opacity-50 py-2 rounded-3 mx-2">
                        <FaUsers className="me-2 text-info" />
                        <span className="fw-medium text-light">{club.members?.length || 0} Members</span>
                      </div>
                      
                      <Link to={`/clubs/${club._id}`} className="btn btn-outline-custom w-100 rounded-pill mx-2" style={{ maxWidth: 'calc(100% - 1rem)' }}>
                        View Club Details <FaArrowRight className="ms-1 fs-7" />
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </AnimatePresence>
        </Row>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .fs-7 { font-size: 0.8rem; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>
    </Container>
  );
};

export default Clubs;
