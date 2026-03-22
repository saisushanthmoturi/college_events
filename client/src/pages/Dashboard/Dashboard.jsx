import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaTicketAlt, FaCalendarCheck, FaChartPie, FaBuilding } from 'react-icons/fa';
import api from '../../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ upcoming: 0, attended: 0, upcomingEvents: [] });
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, totalEvents: 0, publishedEvents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const regRes = await api.get('/registrations/my');
        const registrations = regRes.data.registrations;
        
        const upcoming = registrations.filter(r => r.status !== 'cancelled' && !r.attended).length;
        const attended = registrations.filter(r => r.attended).length;
        
        // Next 3 upcoming events user registered for
        const upcomingList = registrations
          .filter(r => r.status !== 'cancelled' && !r.attended)
          .sort((a, b) => new Date(a.event.date) - new Date(b.event.date))
          .map(r => r.event)
          .slice(0, 3);

        setStats({ upcoming, attended, upcomingEvents: upcomingList });

        // If admin, fetch overall stats
        if (['superadmin', 'clubadmin', 'club_president', 'club_vp'].includes(user.role)) {
          const statsRes = await api.get('/events/stats');
          let usersCount = 0;
          if (user.role === 'superadmin') {
            const usersRes = await api.get('/users?limit=1');
            usersCount = usersRes.data.pagination.total;
          }
          setAdminStats({
            totalEvents: statsRes.data.stats.totalEvents,
            publishedEvents: statsRes.data.stats.publishedEvents,
            totalUsers: usersCount
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  return (
    <Container className="py-5 animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-panel p-4 p-md-5 rounded-4 mb-5 border-0 bg-gradient-hover position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(36,40,59,0.8) 0%, rgba(26,27,38,0.9) 100%)' }}>
        <div className="position-absolute end-0 top-0 h-100 w-50" style={{ background: 'radial-gradient(circle at right center, rgba(122,162,247,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <Row className="align-items-center position-relative z-1">
          <Col md={8}>
            <h1 className="fw-bold mb-2">Welcome defined! 👋</h1>
            <h1 className="fw-bold display-5 mb-2 text-light">Welcome back, <span className="text-primary">{user.name.split(' ')[0]}</span>!</h1>
            <p className="text-secondary fs-5 mb-0">Here's your personal digest of campus activities.</p>
          </Col>
          <Col md={4} className="d-flex justify-content-md-end mt-4 mt-md-0 pt-2 pt-md-0">
             {user.role === 'superadmin' ? (
                <Link to="/admin/events" className="btn btn-primary-custom rounded-pill shadow-sm px-4">Admin Hub</Link>
             ) : ['clubadmin', 'club_president', 'club_vp'].includes(user.role) ? (
                <Link to="/admin/events" className="btn btn-warning text-dark rounded-pill fw-bold shadow-sm px-4">Manage My Club</Link>
             ) : (
                <Link to="/events" className="btn btn-primary-custom rounded-pill shadow-sm px-4 py-2 d-flex align-items-center">Find New Events</Link>
             )}
          </Col>
        </Row>
      </div>

      <Row className="g-4 mb-5">
        {/* Stat Card 1 */}
        <Col md={4}>
          <Card className="glass-card text-light h-100 border-0 p-4 hover-lift">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-secondary fw-semibold mb-0">Upcoming Bookings</h5>
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary"><FaTicketAlt size={20} /></div>
            </div>
            <h2 className="display-4 fw-bold mb-0 text-light">{loading ? '-' : stats.upcoming}</h2>
          </Card>
        </Col>
        {/* Stat Card 2 */}
        <Col md={4}>
          <Card className="glass-card text-light h-100 border-0 p-4 hover-lift">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-secondary fw-semibold mb-0">Events Attended</h5>
              <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success"><FaCalendarCheck size={20} /></div>
            </div>
            <h2 className="display-4 fw-bold mb-0 text-light">{loading ? '-' : stats.attended}</h2>
          </Card>
        </Col>
        {/* User Card */}
        <Col md={4}>
          <Card className="glass-card text-light h-100 border-0 p-4 d-flex justify-content-center hover-lift position-relative">
             <div className="position-absolute end-0 top-0 m-3 px-2 py-1 bg-dark rounded text-uppercase small text-secondary fw-bold" style={{ fontSize: '0.7rem' }}>{user.role}</div>
             <div className="d-flex align-items-center">
               <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                 {user.name.charAt(0)}
               </div>
               <div className="w-100 overflow-hidden">
                 <h5 className="fw-bold mb-1 text-truncate">{user.name}</h5>
                 <p className="text-secondary small mb-0 text-truncate">{user.email}</p>
                 <Link to="/profile" className="text-primary small text-decoration-none mt-1 d-block">Edit Profile →</Link>
               </div>
             </div>
          </Card>
        </Col>
      </Row>

      {/* Admin specific quick links block */}
      {['superadmin', 'clubadmin', 'club_president', 'club_vp'].includes(user.role) && (
        <div className="mb-5">
          <h4 className="fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">Admin Tools</h4>
          
          {/* Admin Stats Row */}
          <Row className="g-3 mb-4">
            <Col sm={4}>
              <Card className="glass-card bg-primary bg-opacity-10 border-primary border-opacity-25 p-3 h-100">
                <div className="text-secondary small text-uppercase fw-bold mb-1">Total Events</div>
                <h3 className="fw-bold text-light mb-0">{adminStats.totalEvents}</h3>
              </Card>
            </Col>
            <Col sm={4}>
              <Card className="glass-card bg-success bg-opacity-10 border-success border-opacity-25 p-3 h-100">
                <div className="text-secondary small text-uppercase fw-bold mb-1">Published Events</div>
                <h3 className="fw-bold text-light mb-0">{adminStats.publishedEvents}</h3>
              </Card>
            </Col>
            {user.role === 'superadmin' && (
              <Col sm={4}>
                <Card className="glass-card bg-info bg-opacity-10 border-info border-opacity-25 p-3 h-100">
                  <div className="text-secondary small text-uppercase fw-bold mb-1">Total Users</div>
                  <h3 className="fw-bold text-light mb-0">{adminStats.totalUsers}</h3>
                </Card>
              </Col>
            )}
          </Row>

          <Row className="g-3">
            <Col sm={6} md={3}>
              <Link to="/admin/events" className="text-decoration-none">
                <Card className="glass-card bg-dark bg-opacity-50 text-center p-4 border-0 hover-lift text-light">
                  <FaChartPie size={32} className="text-warning mb-3 mx-auto" />
                  <h6 className="fw-bold mb-0">Event Approvals</h6>
                </Card>
              </Link>
            </Col>
            {user.role === 'superadmin' && (
              <Col sm={6} md={3}>
                <Link to="/admin/users" className="text-decoration-none">
                  <Card className="glass-card bg-dark bg-opacity-50 text-center p-4 border-0 hover-lift text-light">
                    <FaUserCircle size={32} className="text-info mb-3 mx-auto" />
                    <h6 className="fw-bold mb-0">User Management</h6>
                  </Card>
                </Link>
              </Col>
            )}
          </Row>
        </div>
      )}

      {/* Up Next List */}
      <div>
        <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary border-opacity-25 pb-2">
           <h4 className="fw-bold mb-0">Up Next for You</h4>
           <Link to="/my-registrations" className="text-primary text-decoration-none small">View all →</Link>
        </div>
        
        {loading ? (
          <div><Spinner animation="grow" variant="primary" size="sm" /></div>
        ) : stats.upcomingEvents.length === 0 ? (
          <div className="glass-card p-4 text-center text-secondary border-0">
             <FaCalendarCheck size={32} className="mb-2 opacity-50" />
             <p className="mb-0">No upcoming events. Time to sign up for something new!</p>
          </div>
        ) : (
          <Row className="g-3">
            {stats.upcomingEvents.map(event => (
              <Col lg={4} key={event._id}>
                <Card className="glass-card p-3 border-0 bg-dark bg-opacity-50 h-100 flex-row align-items-center">
                  <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3 text-center me-3 border border-primary border-opacity-25" style={{ minWidth: '70px' }}>
                    <div className="small text-uppercase fw-bold lh-1">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div className="fs-4 fw-bold lh-1 mt-1">{new Date(event.date).getDate()}</div>
                  </div>
                  <div className="overflow-hidden">
                    <Link to={`/events/${event._id}`} className="text-light text-decoration-none">
                      <h6 className="fw-bold mb-1 text-truncate">{event.title}</h6>
                    </Link>
                    <p className="text-secondary small mb-0 text-truncate">{event.venue} • {event.time}</p>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <style>{`
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </Container>
  );
};

export default Dashboard;
