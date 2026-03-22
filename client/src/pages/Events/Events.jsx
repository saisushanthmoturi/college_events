import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Badge, Button, Spinner } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaFilter } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../../utils/api';

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories] = useState(['All', 'workshop', 'seminar', 'hackathon', 'competition', 'cultural', 'sports', 'other']);
  
  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let query = '/events?limit=50';
      if (currentCategory !== 'All') query += `&category=${currentCategory}`;
      if (currentSearch) query += `&search=${currentSearch}`;
      
      const res = await api.get(query);
      setEvents(res.data.events);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentCategory, currentSearch]);

  const handleSearch = (e) => {
    const value = e.target.value;
    if (value) {
      searchParams.set('search', value);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (cat) => {
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const getCategoryTheme = (category) => {
    const themes = { workshop: 'info', hackathon: 'primary', cultural: 'secondary', sports: 'success', seminar: 'warning', competition: 'danger' };
    return themes[category] || 'primary';
  };

  return (
    <Container className="py-5 animate-fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
        <div>
          <h1 className="fw-bold display-5 mb-2">Discover Events</h1>
          <p className="text-secondary fs-5 mb-0">Find and register for the best activities on campus.</p>
        </div>
      </div>

      <Row className="mb-5 g-3">
        <Col md={6} lg={4}>
          <div className="position-relative">
            <FaSearch className="position-absolute top-50 translate-middle-y text-secondary ms-3" />
            <Form.Control
              type="text"
              placeholder="Search by event title..."
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
      ) : events.length === 0 ? (
        <div className="glass-panel text-center py-5 px-3 rounded-4 shadow-sm">
          <FaCalendarAlt size={48} className="text-secondary opacity-50 mb-3" />
          <h3 className="fw-bold">No Events Found</h3>
          <p className="text-secondary text-center mb-0 mt-2">Try adjusting your search criteria or category filter.</p>
        </div>
      ) : (
        <Row className="g-4">
          <AnimatePresence>
            {events.map((event, idx) => (
              <Col lg={4} md={6} key={event._id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="h-100"
                >
                  <Card className="glass-card text-light h-100 border-0 bg-transparent">
                    <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
                      <Card.Img
                        variant="top"
                        src={event.coverImage ? (event.coverImage.startsWith('http') ? event.coverImage : `http://localhost:5001${event.coverImage}`) : `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80`}
                        className="h-100 w-100 object-fit-cover transition-transform"
                      />
                      <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-hover" style={{ background: 'linear-gradient(to top, rgba(26,27,38,1) 0%, transparent 60%)' }}></div>
                      <Badge bg={getCategoryTheme(event.category)} className="position-absolute top-0 end-0 m-3 px-3 py-2 text-uppercase letter-spacing-1 shadow-sm">
                        {event.category}
                      </Badge>
                      
                      <div className="position-absolute bottom-0 start-0 p-3 w-100 d-flex justify-content-between align-items-end">
                        {event.club && (
                          <div className="d-flex align-items-center bg-dark bg-opacity-75 px-2 py-1 rounded-pill blur-bg" style={{ backdropFilter: 'blur(4px)' }}>
                            {event.club.logo ? (
                              <img src={event.club.logo.startsWith('http') ? event.club.logo : `http://localhost:5001${event.club.logo}`} alt="" className="rounded-circle me-2" style={{ width: '20px', height: '20px', objectFit: 'cover' }} />
                            ) : null}
                            <span className="small fw-medium">{event.club.name}</span>
                          </div>
                        )}
                        <h5 className="mb-0 fw-bold">{event.price === 0 ? <span className="text-success">FREE</span> : `₹${event.price}`}</h5>
                      </div>
                    </div>
                    
                    <Card.Body className="d-flex flex-column p-4">
                      <h4 className="fw-bold mb-3 line-clamp-2">{event.title}</h4>
                      
                      <div className="d-flex align-items-center text-secondary mb-2 small">
                        <FaCalendarAlt className="me-2 text-primary" />
                        <span>{format(new Date(event.date), 'MMM dd, yyyy')} • {event.time}</span>
                      </div>
                      
                      <div className="d-flex align-items-center text-secondary mb-4 small">
                        <FaMapMarkerAlt className="me-2 text-danger" />
                        <span className="text-truncate">{event.venue}</span>
                      </div>
                      
                      <div className="mt-auto pt-3 border-top border-secondary border-opacity-25 border-top-dashed d-flex justify-content-between align-items-center">
                        <span className="text-secondary small">
                          <span className="text-primary fw-bold">{event.registrationCount}</span> / {event.capacity} registered
                        </span>
                        <Link to={`/events/${event._id}`} className="btn btn-outline-custom btn-sm rounded-pill px-4">
                          View
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </AnimatePresence>
        </Row>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .glass-card:hover .transition-transform { transform: scale(1.08); transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>
    </Container>
  );
};

export default Events;
