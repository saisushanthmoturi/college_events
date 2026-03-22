import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Badge, Button, Spinner, Tab, Tabs } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowLeft, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';
import { format } from 'date-fns';
import { useRazorpay } from 'react-razorpay';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { Razorpay } = useRazorpay();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.event);
        
        // Check registration status if user logged in
        if (user) {
          const regRes = await api.get('/registrations/my');
          const isRegistered = regRes.data.registrations.some(reg => reg.event._id === id && reg.status !== 'cancelled');
          setHasRegistered(isRegistered);
        }
      } catch (error) {
        console.error('Failed to fetch event details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id, user]);

  const handleRegistration = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    if (event.price > 0) {
      handlePayment();
    } else {
      processFreeRegistration();
    }
  };

  const processFreeRegistration = async () => {
    setRegistering(true);
    try {
      await api.post('/registrations', { eventId: id, amountPaid: 0 });
      setHasRegistered(true);
      Swal.fire({
        icon: 'success',
        title: 'Registered!',
        text: 'You have successfully registered for the event.',
        background: '#1a1b26',
        color: '#c0caf5',
        confirmButtonColor: '#7aa2f7'
      });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Registration Failed', text: error.response?.data?.message || 'Something went wrong.' });
    } finally {
      setRegistering(false);
    }
  };

  const handlePayment = async () => {
    setRegistering(true);
    try {
      // 1. Create order
      const orderRes = await api.post('/payments/create-order', {
        amount: event.price,
        eventId: event._id,
        eventTitle: event.title,
      });

      const { order, key } = orderRes.data;

      // 2. Open Razorpay Widget
      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'CampusSync Events',
        description: `Registration for ${event.title}`,
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify Payment
          try {
            const verifyRes = await api.post('/payments/verify', response);
            if (verifyRes.data.success) {
              // 4. Create Registration
              await api.post('/registrations', {
                eventId: event._id,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amountPaid: event.price
              });
              
              setHasRegistered(true);
              Swal.fire({ icon: 'success', title: 'Payment Successful!', text: 'Your registration is confirmed.', background: '#1a1b26', color: '#c0caf5', confirmButtonColor: '#7aa2f7' });
            }
          } catch (err) {
            Swal.fire('Error', 'Payment verification failed', 'error');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '9999999999'
        },
        theme: { color: '#7aa2f7' }
      };

      const rzpay = new Razorpay(options);
      rzpay.open();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Payment gateway module failed or keys not configured. (Use free test mode)', 'error');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="text-center py-5 vh-100 d-flex align-items-center justify-content-center"><Spinner animation="border" variant="primary" /></div>;
  if (!event) return <Container className="py-5 text-center"><h2>Event Not Found</h2></Container>;

  const isFull = event.registrationCount >= event.capacity;

  return (
    <>
      {/* Event Header Banner */}
      <div 
        className="position-relative w-100" 
        style={{ height: '400px', backgroundImage: `url(${event.coverImage ? (event.coverImage.startsWith('http') ? event.coverImage : `http://localhost:5001${event.coverImage}`) : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'})`, backgroundSize: 'cover', backgroundPosition: 'center', marginTop: '-2rem' }}
      >
        <div className="position-absolute w-100 h-100 top-0 start-0" style={{ background: 'linear-gradient(to bottom, rgba(13,14,21,0.2), var(--bg-color))' }}></div>
        
        <Container className="position-absolute bottom-0 start-50 translate-middle-x w-100 pb-4">
          <Button variant="link" as={Link} to="/events" className="text-light text-decoration-none px-0 mb-3 d-flex align-items-center opacity-75 hover-opacity-100">
            <FaArrowLeft className="me-2" /> Back to Events
          </Button>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Badge bg="primary" className="px-3 py-2 text-uppercase letter-spacing-1">{event.category}</Badge>
            {event.price === 0 && <Badge bg="success" className="px-3 py-2 text-uppercase letter-spacing-1">Free</Badge>}
          </div>
          <h1 className="display-4 fw-bold text-light mb-0 shadow-sm">{event.title}</h1>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="g-5">
          {/* Main Content */}
          <Col lg={8}>
            <div className="glass-panel p-4 p-md-5 mb-5 h-100">
              <Tabs defaultActiveKey="about" className="mb-4 custom-tabs">
                <Tab eventKey="about" title="About Event">
                  <div className="pt-3">
                    <h4 className="fw-bold mb-4">Description</h4>
                    <div className="text-light opacity-75 fs-5 bg-transparent" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                      {event.description}
                    </div>
                  </div>
                </Tab>
                
                {event.gallery && event.gallery.length > 0 && (
                  <Tab eventKey="gallery" title="Gallery">
                    <Row className="g-3 pt-4">
                      {event.gallery.map((img, idx) => (
                        <Col md={6} key={idx}>
                          <img src={img.startsWith('http') ? img : `http://localhost:5001${img}`} alt="Gallery" className="img-fluid rounded-3" />
                        </Col>
                      ))}
                    </Row>
                  </Tab>
                )}
                
                <Tab eventKey="organizer" title="Organizer">
                  <div className="pt-4 d-flex align-items-center">
                    {event.club && (
                      <div className="me-4 text-center">
                        {event.club.logo ? (
                          <img src={event.club.logo.startsWith('http') ? event.club.logo : `http://localhost:5001${event.club.logo}`} alt="Club Logo" className="rounded-circle border border-secondary p-1 bg-dark" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                        ) : (
                          <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}><FaUsers size={32} /></div>
                        )}
                      </div>
                    )}
                    <div>
                      <h4 className="fw-bold mb-1">{event.club ? event.club.name : 'Independent Event'}</h4>
                      <p className="text-secondary mb-0">Organized by {event.organizer.name}</p>
                      {event.club && <Link to={`/clubs/${event.club._id}`} className="btn btn-link text-primary p-0 mt-2">View Club Profile</Link>}
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <div className="glass-card position-sticky" style={{ top: '100px' }}>
              <div className="p-4 border-bottom border-secondary border-opacity-25 bg-primary bg-opacity-10 text-center">
                <h2 className="fw-bold text-primary mb-0">{event.price === 0 ? 'FREE' : `₹${event.price}`}</h2>
              </div>
              
              <div className="p-4">
                <ul className="list-unstyled mb-4 d-flex flex-column gap-3">
                  <li className="d-flex align-items-start">
                    <FaCalendarAlt className="text-secondary fs-4 mt-1 me-3" />
                    <div>
                      <h6 className="fw-bold mb-1 text-light">Date and Time</h6>
                      <p className="text-secondary mb-0 small">{format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}</p>
                      <p className="text-secondary mb-0 small">{event.time}</p>
                    </div>
                  </li>
                  <li className="d-flex align-items-start">
                    <FaMapMarkerAlt className="text-secondary fs-4 mt-1 me-3" />
                    <div>
                      <h6 className="fw-bold mb-1 text-light">Location</h6>
                      <p className="text-secondary mb-0 small">{event.venue}</p>
                    </div>
                  </li>
                  <li className="d-flex align-items-start">
                    <FaUsers className="text-secondary fs-4 mt-1 me-3" />
                    <div>
                      <h6 className="fw-bold mb-1 text-light">Capacity</h6>
                      <p className="text-secondary mb-0 small">{event.registrationCount} / {event.capacity} registered</p>
                    </div>
                  </li>
                  {event.chiefGuest && (
                    <li className="d-flex align-items-start mt-3 border-top border-secondary border-opacity-25 pt-3">
                      <div>
                        <h6 className="fw-bold mb-1 text-light text-uppercase fs-7 text-secondary">Chief Guest</h6>
                        <p className="text-light mb-0">{event.chiefGuest}</p>
                      </div>
                    </li>
                  )}
                  {event.hostDetails && (
                    <li className="d-flex align-items-start mt-2">
                      <div>
                        <h6 className="fw-bold mb-1 text-light text-uppercase fs-7 text-secondary">Host Details</h6>
                        <p className="text-light mb-0">{event.hostDetails}</p>
                      </div>
                    </li>
                  )}
                </ul>

                {hasRegistered ? (
                  <Button variant="success" className="w-100 py-3 rounded-3 d-flex align-items-center justify-content-center" disabled>
                    <FaCheckCircle className="me-2" /> Registered Successfully
                  </Button>
                ) : isFull ? (
                  <Button variant="secondary" className="w-100 py-3 rounded-3" disabled>Event Full</Button>
                ) : (
                  <Button 
                    variant="primary" 
                    className="w-100 btn-primary-custom py-3 rounded-3 fs-5"
                    onClick={handleRegistration}
                    disabled={registering}
                  >
                    {registering ? 'Processing...' : (event.price === 0 ? 'Register Now' : <><FaMoneyBillWave className="me-2" /> Pay to Register</>)}
                  </Button>
                )}
                
                <p className="text-center text-secondary small mt-3 mb-0">
                  {event.price > 0 ? 'Secure payment via Razorpay' : 'No credit card required'}
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      
      <style>{`
        .custom-tabs .nav-link { color: var(--text-secondary); background: transparent; border: none; font-weight: 500; font-size: 1.1rem; padding-bottom: 1rem; border-bottom: 2px solid transparent; }
        .custom-tabs .nav-link:hover { color: var(--text-light); }
        .custom-tabs .nav-link.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
        .hover-opacity-100:hover { opacity: 1 !important; }
      `}</style>
    </>
  );
};

export default EventDetail;
