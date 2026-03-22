import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { FaCheck, FaTimes, FaEye, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const AdminEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Super admins see all, club admins see their own
      const query = user.role === 'superadmin' ? '/events?all=true' : `/events?organizer=${user._id}&all=true`;
      const res = await api.get(query);
      setEvents(res.data.events);
    } catch (error) {
      console.error('Failed to fetch admin events', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, title) => {
    const result = await Swal.fire({
      title: 'Approve Event?',
      text: `Are you sure you want to approve and publish "${title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      background: '#1a1b26',
      color: '#c0caf5',
      confirmButtonColor: '#9ece6a'
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/events/${id}/approve`);
        Swal.fire({ title: 'Approved!', icon: 'success', background: '#1a1b26', color: '#c0caf5' });
        fetchEvents();
      } catch (error) {
        Swal.fire('Error', 'Failed to approve event', 'error');
      }
    }
  };

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: 'Delete Event?',
      text: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      background: '#1a1b26',
      color: '#c0caf5',
      confirmButtonColor: '#f7768e'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/events/${id}`);
        Swal.fire({ title: 'Deleted!', icon: 'success', background: '#1a1b26', color: '#c0caf5' });
        fetchEvents();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete event', 'error');
      }
    }
  };

  const getStatusBadge = (status, isApproved) => {
    if (!isApproved && status === 'draft') return <Badge bg="warning" className="text-dark">Pending Approval</Badge>;
    const map = {
      draft: 'secondary',
      published: 'success',
      ongoing: 'primary',
      completed: 'info',
      cancelled: 'danger'
    };
    return <Badge bg={map[status] || 'secondary'} className="text-uppercase">{status}</Badge>;
  };

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !e.isApproved;
    if (filter === 'published') return e.isApproved && e.status === 'published';
    return e.status === filter;
  });

  if (loading) return <div className="text-center py-5 vh-100"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container className="py-5 animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        <div>
          <h1 className="fw-bold display-6 mb-1">Event Management</h1>
          <p className="text-secondary mb-0">Manage, approve, and track college events.</p>
        </div>
        <div className="d-flex gap-2">
          {user.role === 'clubadmin' && (
            <Button className="btn-primary-custom rounded-pill px-4 d-flex align-items-center gap-2">
              <FaPlus /> Create Event
            </Button>
          )}
        </div>
      </div>

      <Card className="glass-panel border-0 rounded-4 overflow-hidden p-0 mb-4">
        <div className="p-4 border-bottom border-secondary border-opacity-25 bg-dark bg-opacity-25 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h5 className="fw-bold mb-0 text-light">All Events ({filteredEvents.length})</h5>
          <Form.Select 
            className="w-auto bg-dark border-secondary text-light fs-7" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="pending">Pending Approval</option>
            <option value="published">Published</option>
            <option value="completed">Completed</option>
          </Form.Select>
        </div>

        <div className="table-responsive p-0">
          <Table hover variant="dark" className="mb-0 custom-table align-middle">
            <thead>
              <tr className="bg-transparent text-secondary small text-uppercase">
                <th className="ps-4 fw-medium border-secondary border-opacity-25">Event Name</th>
                <th className="fw-medium border-secondary border-opacity-25">Date</th>
                <th className="fw-medium border-secondary border-opacity-25">Club</th>
                <th className="fw-medium border-secondary border-opacity-25">Status</th>
                <th className="fw-medium border-secondary border-opacity-25">Registrations</th>
                <th className="pe-4 text-end fw-medium border-secondary border-opacity-25">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-secondary border-0">
                    No events found matching the current filter.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(event => (
                  <tr key={event._id} className="border-secondary border-opacity-10">
                    <td className="ps-4 py-3">
                      <div className="fw-bold text-light mb-1">{event.title}</div>
                      <div className="small text-secondary">{event.category}</div>
                    </td>
                    <td className="py-3 text-light small">
                      {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 text-secondary small">
                      {event.club?.name || 'Independent'}
                    </td>
                    <td className="py-3">
                      {getStatusBadge(event.status, event.isApproved)}
                    </td>
                    <td className="py-3 text-light small">
                      <span className="text-primary fw-bold">{event.registrationCount}</span> / {event.capacity}
                    </td>
                    <td className="pe-4 py-3 text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <Button 
                          as={Link} 
                          to={`/events/${event._id}`} 
                          variant="outline-info" 
                          size="sm" 
                          className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                          title="View Details"
                        >
                          <FaEye />
                        </Button>
                        
                        {user.role === 'superadmin' && !event.isApproved && (
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            className="rounded-circle p-2 d-flex align-items-center justify-content-center border-success text-success hover-bg-success"
                            onClick={() => handleApprove(event._id, event.title)}
                            title="Approve Event"
                          >
                            <FaCheck />
                          </Button>
                        )}

                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="rounded-circle p-2 d-flex align-items-center justify-content-center border-danger text-danger hover-bg-danger"
                          onClick={() => handleDelete(event._id, event.title)}
                          title="Delete Event"
                        >
                          <FaTimes />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>
      
      <style>{`
        .custom-table { --bs-table-bg: transparent; --bs-table-hover-bg: rgba(255,255,255,0.02); }
        .custom-table td { border-bottom: 1px solid rgba(255,255,255,0.05); }
        .hover-bg-success:hover { background-color: var(--success); color: #000 !important; }
        .hover-bg-danger:hover { background-color: var(--danger); color: #fff !important; }
        .fs-7 { font-size: 0.85rem; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </Container>
  );
};

export default AdminEvents;
