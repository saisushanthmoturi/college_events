import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowRight } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../../utils/api';

const Landing = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, publishedEvents: 0, completedEvents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [eventsRes, statsRes] = await Promise.all([
          api.get('/events?featured=true&limit=3'),
          api.get('/events/stats').catch(() => ({ data: { stats: { totalEvents: 25, publishedEvents: 12, completedEvents: 40 } } }))
        ]);
        
        setFeaturedEvents(eventsRes.data.events);
        if (statsRes.data.stats) {
          setStats(statsRes.data.stats);
        }
      } catch (error) {
        console.error('Error fetching landing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  const getCategoryTheme = (category) => {
    const themes = {
      workshop: 'info',
      hackathon: 'primary',
      cultural: 'secondary',
      sports: 'success',
      seminar: 'warning',
      competition: 'danger'
    };
    return themes[category] || 'primary';
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section position-relative d-flex align-items-center mb-5" style={{ minHeight: '80vh', overflow: 'hidden' }}>
        {/* Abstract Background Shapes */}
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0, opacity: 0.4 }}>
          <div className="position-absolute rounded-circle blur-bg" style={{ width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--primary-color) 0%, transparent 70%)', top: '-10%', right: '-5%', filter: 'blur(80px)' }}></div>
          <div className="position-absolute rounded-circle blur-bg" style={{ width: '30vw', height: '30vw', background: 'radial-gradient(circle, var(--secondary-color) 0%, transparent 70%)', bottom: '-10%', left: '-5%', filter: 'blur(80px)' }}></div>
        </div>

        <Container className="position-relative" style={{ zIndex: 1 }}>
          <Row className="align-items-center">
            <Col lg={7} className="mb-5 mb-lg-0">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <Badge bg="transparent" className="border border-primary text-primary mb-3 px-3 py-2 rounded-pill fs-6">
                  ✨ The Future of Campus Events
                </Badge>
                <h1 className="display-3 fw-bold mb-4" style={{ lineHeight: '1.2' }}>
                  Discover. Connect. <span style={{ background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Experience.</span>
                </h1>
                <p className="lead text-secondary mb-5 pe-lg-5 fs-4" style={{ maxWidth: '600px' }}>
                  Your all-in-one platform to explore college clubs, register for exciting events, and build your extracurricular portfolio.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <Button as={Link} to="/events" size="lg" className="btn-primary-custom px-5 py-3 fs-5 rounded-pill shadow-lg">
                    Explore Events <FaArrowRight className="ms-2" />
                  </Button>
                  <Button as={Link} to="/register" size="lg" className="btn-outline-custom px-5 py-3 fs-5 rounded-pill">
                    Join Now
                  </Button>
                </div>
              </motion.div>
            </Col>
            
            <Col lg={5} className="d-none d-lg-block">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
                className="position-relative"
              >
                <div className="glass-card p-2 shadow-lg" style={{ transform: 'rotate(5deg)' }}>
                  <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Concert" className="img-fluid rounded-3" />
                </div>
                <div className="glass-card p-2 shadow-lg position-absolute top-50 start-0 translate-middle-y" style={{ transform: 'rotate(-5deg) translateX(-20%)', width: '70%' }}>
                  <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Hackathon" className="img-fluid rounded-3" />
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5 position-relative">
        <Container>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-5 mt-n5 position-relative shadow-lg"
            style={{ zIndex: 10, marginTop: '-80px' }}
          >
            <Row className="text-center g-4">
              <Col md={4}>
                <h2 className="display-4 fw-bold text-primary mb-1">{stats.totalEvents || 120}+</h2>
                <p className="text-secondary fs-5 mb-0">Events Hosted</p>
              </Col>
              <Col md={4}>
                <h2 className="display-4 fw-bold text-success mb-1">{stats.publishedEvents || 45}</h2>
                <p className="text-secondary fs-5 mb-0">Active Clubs</p>
              </Col>
              <Col md={4}>
                <h2 className="display-4 fw-bold text-info mb-1">{stats.completedEvents || '5k'}+</h2>
                <p className="text-secondary fs-5 mb-0">Students Registered</p>
              </Col>
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Featured Events Section */}
      <section className="py-5 my-5">
        <Container>
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <h2 className="fw-bold display-5 mb-2">Featured Events</h2>
              <p className="text-secondary fs-5">Don't miss out on the most anticipated activities this month.</p>
            </div>
            <Button as={Link} to="/events" variant="link" className="text-primary text-decoration-none fs-5 d-none d-md-block p-0">
              View All Events <FaArrowRight className="ms-1" />
            </Button>
          </div>

          <Row className="g-4">
            {loading ? (
              // Loading skeletons
              [1, 2, 3].map((n) => (
                <Col lg={4} md={6} key={n}>
                  <div className="glass-card" style={{ height: '400px' }}></div>
                </Col>
              ))
            ) : featuredEvents.length > 0 ? (
              featuredEvents.map((event, idx) => (
                <Col lg={4} md={6} key={event._id}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="h-100"
                  >
                    <Card className="glass-card text-light h-100 border-0 bg-transparent">
                      <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                        <Card.Img 
                          variant="top" 
                          src={event.coverImage ? (event.coverImage.startsWith('http') ? event.coverImage : `http://localhost:5001${event.coverImage}`) : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600"} 
                          className="h-100 w-100 object-fit-cover transition-transform"
                          style={{ transition: 'transform 0.5s ease' }}
                        />
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to top, rgba(26, 27, 38, 1), transparent)' }}></div>
                        <Badge bg={getCategoryTheme(event.category)} className="position-absolute top-0 end-0 m-3 px-3 py-2 text-uppercase letter-spacing-1">
                          {event.category}
                        </Badge>
                      </div>
                      
                      <Card.Body className="d-flex flex-column p-4">
                        <h4 className="fw-bold mb-3">{event.title}</h4>
                        
                        <div className="d-flex align-items-center text-secondary mb-2 small">
                          <FaCalendarAlt className="me-2 text-primary" />
                          <span>{format(new Date(event.date), 'MMM dd, yyyy')} • {event.time}</span>
                        </div>
                        
                        <div className="d-flex align-items-center text-secondary mb-4 small">
                          <FaMapMarkerAlt className="me-2 text-danger" />
                          <span>{event.venue}</span>
                        </div>
                        
                        <div className="mt-auto pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                          <div className="text-light fw-bold fs-5">
                            {event.price === 0 ? <span className="text-success">FREE</span> : `₹${event.price}`}
                          </div>
                          <Link to={`/events/${event._id}`} className="btn btn-outline-custom btn-sm rounded-pill px-3">
                            View Details
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))
            ) : (
              <Col>
                <div className="glass-panel p-5 text-center text-secondary">
                  <FaCalendarAlt size={48} className="mb-3 opacity-50" />
                  <h4>No prominent events found</h4>
                  <p>Check back later for exciting new activities!</p>
                </div>
              </Col>
            )}
          </Row>
          
          <div className="text-center mt-4 d-md-none">
            <Button as={Link} to="/events" variant="link" className="text-primary text-decoration-none">
              View All Events <FaArrowRight className="ms-1" />
            </Button>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-dark position-relative overflow-hidden">
        <div className="position-absolute w-100 h-100 bg-black opacity-50 top-0 start-0"></div>
        <Container className="position-relative py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold display-5 mb-3">How CampusSync Works</h2>
            <p className="text-secondary fs-5 max-w-700 mx-auto">Three simple steps to unlock your college's extracurricular potential.</p>
          </div>
          
          <Row className="text-center g-5">
            <Col lg={4}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                  <img src="https://cdn-icons-png.flaticon.com/512/3233/3233804.png" alt="Discover" style={{ width: '40px', filter: 'invert(0.5) sepia(1) saturate(5) hue-rotate(200deg)' }} />
                </div>
                <h4 className="fw-bold mb-3">1. Discover Clubs</h4>
                <p className="text-secondary">Explore diverse clubs ranging from technology and coding to arts, culture, and sports.</p>
              </motion.div>
            </Col>
            <Col lg={4}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                  <FaCalendarAlt size={32} />
                </div>
                <h4 className="fw-bold mb-3">2. Register for Events</h4>
                <p className="text-secondary">Secure your spot in hackathons, workshops, and fests with our seamless one-click registration.</p>
              </motion.div>
            </Col>
            <Col lg={4}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                  <img src="https://cdn-icons-png.flaticon.com/512/2912/2912773.png" alt="Certificate" style={{ width: '40px', filter: 'invert(0.7) sepia(1) saturate(3) hue-rotate(350deg)' }} />
                </div>
                <h4 className="fw-bold mb-3">3. Earn Certificates</h4>
                <p className="text-secondary">Attend events and instantly receive verified digital certificates to boost your resume.</p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* CSS to handle Card Image Hover */}
      <style>{`
        .glass-card:hover .card-img-top { transform: scale(1.05); }
      `}</style>
    </div>
  );
};

export default Landing;
