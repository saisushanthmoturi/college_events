import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Badge, Dropdown, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import api from '../../utils/api';

const MainNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          setUnreadCount(res.data.unreadCount);
        } catch (error) {
          console.error('Failed to fetch notifications count', error);
        }
      };
      fetchNotifications();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" variant="dark" className="glass-panel sticky-top mx-3 mt-3 mb-4 rounded-4 px-3" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
          <span className="me-2" style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>❖</span>
          CampusSync
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto ms-4 align-items-center gap-2">
            <Nav.Link as={Link} to="/events" className="fw-medium text-light px-3 rounded hover-bg">Events</Nav.Link>
            <Nav.Link as={Link} to="/clubs" className="fw-medium text-light px-3 rounded hover-bg">Clubs</Nav.Link>
          </Nav>
          
          <Nav className="ms-auto align-items-center gap-3">
            {user ? (
              <>
                <Nav.Link as={Link} to="/notifications" className="position-relative">
                  <FaBell size={20} className="text-light opacity-75" />
                  {unreadCount > 0 && (
                    <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle border border-dark p-1">
                      {unreadCount}
                    </Badge>
                  )}
                </Nav.Link>

                <Dropdown align="end">
                  <Dropdown.Toggle variant="transparent" id="user-dropdown" className="d-flex align-items-center text-light border-0 px-2 py-1 user-dropdown-toggle">
                    {user.avatar ? (
                      <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5001${user.avatar}`} alt="avatar" className="rounded-circle me-2" style={{ width: '32px', height: '32px', objectFit: 'cover' }} />
                    ) : (
                      <FaUserCircle size={28} className="me-2 text-primary" />
                    )}
                    <span className="fw-medium me-1 d-none d-sm-inline">{user.name.split(' ')[0]}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="glass-panel mt-3 border-secondary shadow-lg py-2" variant="dark">
                    <Dropdown.Header className="text-light opacity-75 fw-normal pb-0">{user.email}</Dropdown.Header>
                    <Dropdown.Header className="pt-0 text-primary small text-uppercase fw-bold">{user.role}</Dropdown.Header>
                    <Dropdown.Divider className="border-secondary opacity-25" />
                    
                    <Dropdown.Item as={Link} to="/dashboard" className="py-2 px-4 hover-text-primary">Dashboard</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/my-registrations" className="py-2 px-4 hover-text-primary">My Bookings</Dropdown.Item>
                    
                    {(user.role === 'superadmin' || user.role === 'clubadmin') && (
                      <>
                        <Dropdown.Divider className="border-secondary opacity-25" />
                        <Dropdown.Item as={Link} to="/admin/events" className="py-2 px-4 text-warning">Manage Events</Dropdown.Item>
                      </>
                    )}
                    
                    {user.role === 'superadmin' && (
                      <Dropdown.Item as={Link} to="/admin/users" className="py-2 px-4 text-warning">Manage Users</Dropdown.Item>
                    )}

                    <Dropdown.Divider className="border-secondary opacity-25" />
                    <Dropdown.Item onClick={handleLogout} className="py-2 px-4 text-danger fw-medium">Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-custom text-light me-2 border-secondary bg-transparent hover-bg-secondary">Sign In</Link>
                <Link to="/register" className="btn btn-primary-custom px-4">Register</Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
      <style>{`
        .user-dropdown-toggle::after { border-top-color: rgba(255,255,255,0.5); }
        .hover-bg:hover { background-color: rgba(255,255,255,0.05); }
        .hover-bg-secondary:hover { background-color: rgba(255,255,255,0.1) !important; border-color: transparent !important; }
        .hover-text-primary:hover { color: var(--primary-color) !important; background-color: transparent; }
        .dropdown-item:hover { background-color: rgba(122, 162, 247, 0.1); }
      `}</style>
    </Navbar>
  );
};

export default MainNavbar;
