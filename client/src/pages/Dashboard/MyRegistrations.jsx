import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDownload, FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaExclamationCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get('/registrations/my');
      setRegistrations(res.data.registrations);
    } catch (error) {
      console.error('Failed to fetch registrations', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id, eventTitle) => {
    const result = await Swal.fire({
      title: 'Cancel Registration?',
      text: `Are you sure you want to cancel your registration for ${eventTitle}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f7768e',
      cancelButtonColor: '#565f89',
      confirmButtonText: 'Yes, cancel it',
      background: '#1a1b26',
      color: '#c0caf5',
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/registrations/${id}/cancel`);
        Swal.fire({ title: 'Cancelled', text: 'Registration has been cancelled.', icon: 'success', background: '#1a1b26', color: '#c0caf5' });
        fetchRegistrations();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to cancel', 'error');
      }
    }
  };

  const handleDownloadCertificate = async (id, eventTitle) => {
    try {
      // Create an object URL from the PDF blob
      const res = await api.get(`/certificates/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${eventTitle.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      const isJson = error.response && error.response.data instanceof Blob;
      if (isJson) {
        const text = await error.response.data.text();
        const data = JSON.parse(text);
        Swal.fire({ icon: 'error', title: 'Cannot generate', text: data.message || 'Error generating certificate', background: '#1a1b26', color: '#c0caf5' });
      } else {
         Swal.fire({ icon: 'error', title: 'Error', text: 'Error downloading certificate', background: '#1a1b26', color: '#c0caf5' });
      }
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      confirmed: 'success',
      registered: 'primary',
      waitlisted: 'warning',
      cancelled: 'danger'
    };
    return <Badge bg={map[status] || 'secondary'} className="px-2 py-1 text-uppercase">{status}</Badge>;
  };

  if (loading) return <div className="text-center py-5 vh-100 d-flex align-items-center justify-content-center"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container className="py-5 animate-fade-in">
      <div className="mb-5 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="fw-bold display-6 mb-2">My Bookings</h1>
          <p className="text-secondary mb-0">Manage your event registrations and download certificates.</p>
        </div>
        <Button as={Link} to="/events" className="btn-primary-custom rounded-pill px-4">Browse More Events</Button>
      </div>

      {registrations.length === 0 ? (
        <div className="glass-panel text-center py-5 px-3 rounded-4 shadow-sm">
          <FaTicketAlt size={48} className="text-secondary opacity-50 mb-3" />
          <h3 className="fw-bold">No Registrations Yet</h3>
          <p className="text-secondary text-center mb-0 mt-2">You haven't registered for any events yet. Start exploring!</p>
          <Button as={Link} to="/events" className="btn-outline-custom rounded-pill mt-4 px-4">Explore Events</Button>
        </div>
      ) : (
        <Row className="g-4">
          {registrations.map(reg => (
            <Col lg={12} key={reg._id}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="glass-card text-light border-0 overflow-hidden flex-md-row position-relative">
                   {/* Left Date Block */}
                   <div className="bg-dark bg-opacity-50 d-flex flex-md-column flex-row align-items-center justify-content-center p-4 border-end border-secondary border-opacity-25" style={{ minWidth: '150px' }}>
                    <div className="text-primary text-uppercase fw-bold ls-1 small">{format(new Date(reg.event.date), 'MMM')}</div>
                    <div className="display-4 fw-bold lh-1 text-light my-md-2 mx-3 mx-md-0">{format(new Date(reg.event.date), 'dd')}</div>
                    <div className="text-secondary small">{reg.event.time}</div>
                   </div>
                   
                   {/* Main Content */}
                   <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center w-100 gap-4">
                     <div>
                       <div className="d-flex align-items-center gap-2 mb-2">
                         {getStatusBadge(reg.status)}
                         {reg.attended && <Badge bg="info" className="px-2 py-1"><FaCheckCircle className="me-1" /> Attended</Badge>}
                       </div>
                       <h4 className="fw-bold mb-2">
                         <Link to={`/events/${reg.event._id}`} className="text-light text-decoration-none hover-primary transition">
                           {reg.event.title}
                         </Link>
                       </h4>
                       <div className="d-flex flex-wrap gap-3 text-secondary small">
                         <span className="d-flex align-items-center"><FaMapMarkerAlt className="me-1 text-danger" /> {reg.event.venue}</span>
                         {reg.event.club && <span className="d-flex align-items-center"><FaUsers className="me-1 text-info" /> {reg.event.club.name}</span>}
                         {reg.amountPaid > 0 && <span className="d-flex align-items-center text-success fw-medium">Paid: ₹{reg.amountPaid}</span>}
                       </div>
                     </div>
                     
                     {/* Actions */}
                     <div className="d-flex flex-md-column gap-2 ms-md-auto align-items-stretch">
                       {reg.status !== 'cancelled' && !reg.attended && (
                         <Button variant="outline-danger" className="rounded-pill px-4 ms-auto w-100 fs-7" size="sm" onClick={() => handleCancel(reg._id, reg.event.title)}>
                           Cancel Booking
                         </Button>
                       )}
                       {reg.attended ? (
                         <Button 
                           variant="primary" 
                           className="btn-primary-custom rounded-pill px-4 ms-auto w-100 fs-7 d-flex align-items-center justify-content-center gap-2" 
                           onClick={() => handleDownloadCertificate(reg._id, reg.event.title)}
                         >
                           <FaDownload /> Certificate
                         </Button>
                       ) : (
                         <div className="text-secondary small mt-1 text-end">
                           <FaExclamationCircle className="me-1" /> Attend to get certificate
                         </div>
                       )}
                     </div>
                   </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      )}
      <style>{`
        .ls-1 { letter-spacing: 1px; }
        .hover-primary:hover { color: var(--primary-color) !important; }
        .fs-7 { font-size: 0.85rem; }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </Container>
  );
};

export default MyRegistrations;
