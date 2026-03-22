import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaCalendarAlt, FaTicketAlt } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      // Mark all as read when opening page
      if (res.data.unreadCount > 0) {
        await api.put('/notifications/read-all');
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <FaCheckCircle className="text-success fs-4" />;
      case 'warning': return <FaExclamationTriangle className="text-warning fs-4" />;
      case 'event': return <FaCalendarAlt className="text-primary fs-4" />;
      case 'registration': return <FaTicketAlt className="text-info fs-4" />;
      default: return <FaInfoCircle className="text-secondary fs-4" />;
    }
  };

  if (loading) return <div className="text-center py-5 vh-100 d-flex align-items-center justify-content-center"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container className="py-5 max-w-800 animate-fade-in" style={{ maxWidth: '800px' }}>
      <div className="mb-5 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex align-items-center">
          <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
            <FaBell size={24} className="text-primary" />
          </div>
          <h1 className="fw-bold display-6 mb-0">Notifications</h1>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="glass-panel text-center py-5 px-3 rounded-4 shadow-sm border-0">
          <FaBell size={48} className="text-secondary opacity-25 mb-3" />
          <h4 className="fw-medium text-light opacity-75">You're all caught up!</h4>
          <p className="text-secondary text-center mb-0 mt-2">No new notifications at the moment.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          <AnimatePresence>
            {notifications.map(note => (
              <motion.div 
                key={note._id}
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={`glass-card text-light border-0 transition-all ${!note.read ? 'bg-primary bg-opacity-10 border-start border-primary border-4' : 'opacity-75'}`}
                  onClick={() => markAsRead(note._id, note.read)}
                  style={{ cursor: !note.read ? 'pointer' : 'default' }}
                >
                  <Card.Body className="p-4 d-flex gap-3 align-items-start">
                    <div className="mt-1 flex-shrink-0">
                      {getIcon(note.type)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h5 className={`mb-0 fw-bold ${!note.read ? 'text-light' : 'text-secondary'}`}>
                          {note.title}
                          {!note.read && <span className="ms-2 d-inline-block bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></span>}
                        </h5>
                        <small className="text-secondary opacity-75 ms-2 flex-shrink-0 text-end">
                          {formatDistanceToNow(new Date(note.createdAt))} ago
                        </small>
                      </div>
                      <p className={`mb-2 ${!note.read ? 'text-light opacity-100' : 'text-secondary'}`}>{note.message}</p>
                      
                      {note.link && (
                        <div className="mt-3">
                          <Link to={note.link} className="btn btn-outline-custom btn-sm rounded-pill px-3 py-1 bg-dark">
                            View Details
                          </Link>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <style>{`
        .transition-all { transition: all 0.3s ease; }
        .glass-card:hover { transform: translateY(-2px); border-color: rgba(122,162,247,0.3) !important; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </Container>
  );
};

export default Notifications;
