import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Badge, Button, Spinner, Tab, Tabs, Card, Modal, Form } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUsers, FaArrowLeft, FaCheckCircle, FaCalendarAlt, FaExternalLinkAlt, FaInstagram, FaTwitter } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const ClubDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [club, setClub] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isClubAdmin, setIsClubAdmin] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinReason, setJoinReason] = useState('');

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const [clubRes, eventsRes] = await Promise.all([
          api.get(`/clubs/${id}`),
          api.get(`/events?club=${id}`)
        ]);
        setClub(clubRes.data.club);
        setClubEvents(eventsRes.data.events);
        
        if (user) {
          if (clubRes.data.club.members.some(m => m._id === user._id)) {
            setIsMember(true);
          }
          if (clubRes.data.club.joinRequests && clubRes.data.club.joinRequests.some(r => r.user?._id === user._id && r.status === 'pending')) {
            setHasPendingRequest(true);
          }
          const adminId = clubRes.data.club.admin?._id || clubRes.data.club.admin;
          const presId = clubRes.data.club.president?._id || clubRes.data.club.president;
          const vpId = clubRes.data.club.vicePresident?._id || clubRes.data.club.vicePresident;
          
          if (user.role === 'superadmin' || user._id === adminId || user._id === presId || user._id === vpId) {
            setIsClubAdmin(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch club details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClubData();
  }, [id, user]);

  const handleOpenJoinModal = () => {
    if (!user) {
      Swal.fire({
        title: 'Sign in Required',
        text: 'Please sign in to apply for this club.',
        icon: 'info',
        background: '#1a1b26',
        color: '#c0caf5',
        confirmButtonColor: '#7aa2f7'
      });
      return;
    }
    setShowJoinModal(true);
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setJoining(true);
    try {
      await api.post(`/clubs/${id}/join`, { answers: { reason: joinReason } });
      setHasPendingRequest(true);
      setShowJoinModal(false);
      Swal.fire({ icon: 'success', title: 'Application submitted!', text: 'The club admin will review your request.', background: '#1a1b26', color: '#c0caf5', confirmButtonColor: '#7aa2f7' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Failed to apply', text: error.response?.data?.message || 'Something went wrong.', background: '#1a1b26', color: '#c0caf5' });
    } finally {
      setJoining(false);
    }
  };

  const handleResolveRequest = async (reqId, status) => {
    try {
      await api.post(`/clubs/${id}/requests/${reqId}/resolve`, { status });
      setClub(prev => ({
        ...prev,
        joinRequests: prev.joinRequests.map(r => r._id === reqId ? { ...r, status } : r),
        members: status === 'approved' && prev.joinRequests.find(r => r._id === reqId) ? [...prev.members, prev.joinRequests.find(r => r._id === reqId).user] : prev.members
      }));
      Swal.fire({ icon: 'success', title: `Request ${status}!`, background: '#1a1b26', color: '#c0caf5', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Action failed', text: error.response?.data?.message || 'Something went wrong.', background: '#1a1b26', color: '#c0caf5' });
    }
  };

  const getCategoryTheme = (category) => {
    const themes = { technical: 'info', cultural: 'secondary', sports: 'success', literary: 'warning', social: 'primary' };
    return themes[category] || 'primary';
  };

  if (loading) return <div className="text-center py-5 vh-100 d-flex align-items-center justify-content-center"><Spinner animation="border" variant="primary" /></div>;
  if (!club) return <Container className="py-5 text-center"><h2>Club Not Found</h2></Container>;

  return (
    <>
      {/* Club Header */}
      <div className="position-relative w-100" style={{ height: '300px', backgroundColor: 'var(--surface-color)', marginTop: '-2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Container className="position-absolute bottom-0 start-50 translate-middle-x w-100 pb-4 d-flex align-items-end">
          <div className="d-flex align-items-end w-100">
            <div className="rounded-circle bg-dark border border-secondary border-3 d-flex justify-content-center align-items-center overflow-hidden flex-shrink-0" style={{ width: '120px', height: '120px', marginBottom: '-50px', zIndex: 10 }}>
              {club.logo ? (
                <img src={club.logo.startsWith('http') ? club.logo : `http://localhost:5001${club.logo}`} alt={club.name} className="w-100 h-100 object-fit-cover" />
              ) : (
                <FaUsers size={50} className="text-primary opacity-50" />
              )}
            </div>
            
            <div className="ms-4 pb-2 pb-md-0 d-flex flex-column flex-md-row justify-content-between w-100 align-items-start align-items-md-end">
              <div>
                <Button variant="link" as={Link} to="/clubs" className="text-secondary text-decoration-none px-0 mb-2 p-0 fs-7 d-flex align-items-center">
                  <FaArrowLeft className="me-2" /> Back to Clubs
                </Button>
                <div className="d-flex align-items-center gap-3">
                  <h1 className="display-5 fw-bold text-light mb-0">{club.name}</h1>
                  <Badge bg={getCategoryTheme(club.category)} className="text-uppercase mb-1">{club.category}</Badge>
                </div>
              </div>
              
              <div className="mt-3 mt-md-0 d-flex gap-2">
                 <div className="bg-dark bg-opacity-50 px-3 py-2 rounded-3 border border-secondary border-opacity-25 d-flex align-items-center text-light me-3">
                    <FaUsers className="me-2 text-primary" /> <span className="fw-bold fs-5 me-1">{club.members.length}</span> Members
                 </div>
                 {isMember ? (
                  <Button variant="outline-success" className="rounded-pill px-4" disabled>
                    <FaCheckCircle className="me-2" /> Member
                  </Button>
                ) : hasPendingRequest ? (
                  <Button variant="outline-warning" className="rounded-pill px-4 text-warning" disabled>
                    Pending Approval
                  </Button>
                ) : (
                  <Button variant="primary" className="btn-primary-custom rounded-pill px-5" onClick={handleOpenJoinModal} disabled={joining}>
                    Join Club
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <Row className="g-5">
          <Col lg={8}>
            <div className="glass-panel p-4 p-md-5 mb-5 h-100">
              <Tabs defaultActiveKey="about" className="mb-4 custom-tabs">
                <Tab eventKey="about" title="About">
                  <div className="pt-3">
                    <h4 className="fw-bold mb-4">Description</h4>
                    <div className="text-light opacity-75 fs-5" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                      {club.description}
                    </div>
                  </div>
                </Tab>

                <Tab eventKey="members" title={`Members (${club.members.length})`}>
                  <Row className="g-3 pt-4">
                    {club.members.map((member) => (
                      <Col sm={6} md={4} key={member._id}>
                        <div className="d-flex align-items-center bg-dark bg-opacity-25 p-3 rounded-3 border border-secondary border-opacity-25">
                          {member.avatar ? (
                            <img src={member.avatar.startsWith('http') ? member.avatar : `http://localhost:5001${member.avatar}`} alt={member.name} className="rounded-circle me-3" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                          ) : (
                            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                              {member.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h6 className="mb-0 fw-medium text-light">{member.name}</h6>
                            <small className="text-secondary">{member.department || 'Member'}</small>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Tab>

                {isClubAdmin && (
                  <Tab eventKey="requests" title="Manage Requests">
                    <div className="pt-4">
                      <h4 className="fw-bold mb-4">Pending Applications</h4>
                      {club.joinRequests && club.joinRequests.filter(r => r.status === 'pending').length > 0 ? (
                        <Row className="g-3">
                          {club.joinRequests.filter(r => r.status === 'pending').map(req => (
                            <Col xs={12} key={req._id}>
                              <div className="bg-dark bg-opacity-25 p-3 rounded-3 border border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                <div className="d-flex align-items-start">
                                  {req.user?.avatar ? (
                                    <img src={req.user.avatar.startsWith('http') ? req.user.avatar : `http://localhost:5001${req.user.avatar}`} alt={req.user?.name} className="rounded-circle me-3 mt-1" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                  ) : (
                                    <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3 mt-1" style={{ width: '40px', height: '40px' }}>
                                      {req.user?.name?.charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <h6 className="mb-1 fw-medium text-light">{req.user?.name} <span className="text-secondary small fw-normal ms-2">{req.user?.email}</span></h6>
                                    <p className="text-secondary small mb-1">{req.user?.department} • {req.user?.year}</p>
                                    <div className="text-light bg-dark px-3 py-2 rounded-2 mt-2" style={{ borderLeft: '3px solid var(--primary-color)' }}>
                                      <small className="text-secondary d-block mb-1">Reason for joining:</small>
                                      {req.answers?.reason || <em className="text-secondary">No reason provided</em>}
                                    </div>
                                  </div>
                                </div>
                                <div className="d-flex gap-2 align-self-end align-self-md-center">
                                  <Button variant="outline-danger" size="sm" onClick={() => handleResolveRequest(req._id, 'rejected')}>Reject</Button>
                                  <Button variant="success" size="sm" className="btn-success-custom" onClick={() => handleResolveRequest(req._id, 'approved')}>Approve</Button>
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      ) : (
                        <div className="text-center text-secondary py-5">
                          <p>No pending join requests.</p>
                        </div>
                      )}
                    </div>
                  </Tab>
                )}
              </Tabs>
            </div>
          </Col>

          <Col lg={4}>
            {/* Social Links Card */}
            {club.socialLinks && (club.socialLinks.website || club.socialLinks.instagram || club.socialLinks.twitter) && (
              <div className="glass-card mb-4 p-4">
                <h5 className="fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">Connect</h5>
                <div className="d-flex flex-column gap-3">
                  {club.socialLinks.website && (
                    <a href={club.socialLinks.website} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center text-light text-decoration-none p-2 rounded hover-bg-light">
                      <FaExternalLinkAlt className="me-3 text-primary fs-5" /> Visit Website
                    </a>
                  )}
                  {club.socialLinks.instagram && (
                    <a href={`https://instagram.com/${club.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center text-light text-decoration-none p-2 rounded hover-bg-light">
                      <FaInstagram className="me-3 text-accent fs-5" style={{ color: '#E1306C' }} /> Instagram Profile
                    </a>
                  )}
                  {club.socialLinks.twitter && (
                    <a href={`https://twitter.com/${club.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center text-light text-decoration-none p-2 rounded hover-bg-light">
                      <FaTwitter className="me-3 text-info fs-5" /> Twitter Feed
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Admin Info */}
            <div className="glass-card mb-4 p-4 text-center">
              <h5 className="fw-bold mb-4 border-bottom border-secondary border-opacity-25 pb-2 text-start">Faculty / Club Admin</h5>
              {club.admin.avatar ? (
                <img src={club.admin.avatar.startsWith('http') ? club.admin.avatar : `http://localhost:5001${club.admin.avatar}`} alt={club.admin.name} className="rounded-circle mb-3" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
              ) : (
                <div className="rounded-circle bg-primary bg-opacity-25 d-inline-flex border border-primary align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                  <FaUsers size={40} className="text-primary" />
                </div>
              )}
              <h5 className="mb-0 text-light fw-bold">{club.admin.name}</h5>
              <p className="text-secondary small">{club.admin.email}</p>
            </div>
          </Col>
        </Row>

        {/* Club Events */}
        {clubEvents.length > 0 && (
          <div className="mt-5 pt-4">
            <h3 className="fw-bold mb-4 pb-2 border-bottom border-secondary border-opacity-25 d-inline-block">Events by {club.name}</h3>
            <Row className="g-4 mt-2">
              {clubEvents.map(event => (
                <Col lg={4} md={6} key={event._id}>
                  <Card className="glass-card text-light h-100 border-0 bg-transparent">
                    <div className="position-relative overflow-hidden" style={{ height: '180px' }}>
                      <Card.Img variant="top" src={event.coverImage ? (event.coverImage.startsWith('http') ? event.coverImage : `http://localhost:5001${event.coverImage}`) : `https://images.unsplash.com/photo-1540575467063-178a50c2df87`} className="h-100 w-100 object-fit-cover" />
                      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to top, rgba(26,27,38,1) 0%, transparent 60%)' }}></div>
                    </div>
                    <Card.Body className="d-flex flex-column p-4">
                      <h5 className="fw-bold mb-2 text-truncate">{event.title}</h5>
                      
                      <div className="text-secondary small mb-3 line-clamp-2">
                        {event.description}
                      </div>

                      <div className="d-flex flex-column gap-2 text-secondary mb-3 small">
                        <div className="d-flex align-items-center">
                          <FaCalendarAlt className="me-2 text-primary" />
                          <span>{format(new Date(event.date), 'MMM dd, yyyy')} • {event.time || 'TBA'}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <FaUsers className="me-2 text-info" />
                          <span>Stats: {event.registrationCount} / {event.capacity} Registrations</span>
                        </div>
                        {(event.chiefGuest || event.hostDetails) && (
                          <div className="mt-2 pt-2 border-top border-secondary border-opacity-25">
                            {event.chiefGuest && <div className="text-light"><span className="text-secondary">Chief Guest:</span> {event.chiefGuest}</div>}
                            {event.hostDetails && <div className="text-light"><span className="text-secondary">Host:</span> {event.hostDetails}</div>}
                          </div>
                        )}
                      </div>

                      {/* Event Pics / Gallery thumbnails */}
                      {event.gallery && event.gallery.length > 0 && (
                        <div className="mb-3 d-flex gap-2 overflow-hidden">
                          {event.gallery.slice(0, 3).map((pic, idx) => (
                            <img 
                              key={idx} 
                              src={pic.startsWith('http') ? pic : `http://localhost:5001${pic}`} 
                              alt="event pic" 
                              className="rounded border border-secondary border-opacity-25" 
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                            />
                          ))}
                          {event.gallery.length > 3 && (
                            <div className="rounded bg-dark d-flex align-items-center justify-content-center text-secondary small border border-secondary border-opacity-25" style={{ width: '40px', height: '40px' }}>
                              +{event.gallery.length - 3}
                            </div>
                          )}
                        </div>
                      )}

                      <Link to={`/events/${event._id}`} className="mt-auto btn btn-outline-custom w-100 btn-sm rounded-pill">View Event Details</Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>
      
      {/* Join Club Modal */}
      <Modal show={showJoinModal} onHide={() => setShowJoinModal(false)} centered className="dark-modal">
        <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25 bg-dark">
          <Modal.Title className="text-light">Apply for {club.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light p-4">
          <Form onSubmit={handleJoinSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="text-secondary">Why do you want to join this club?</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                placeholder="Briefly describe your interest, skills, or what you hope to contribute..."
                value={joinReason}
                onChange={e => setJoinReason(e.target.value)}
                className="bg-transparent text-light min-h-100"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" rounded-pill onClick={() => setShowJoinModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" className="btn-primary-custom rounded-pill" disabled={joining}>
                {joining ? 'Submitting...' : 'Submit Form'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style>{`
        .custom-tabs .nav-link { color: var(--text-secondary); background: transparent; border: none; font-weight: 500; font-size: 1.1rem; padding-bottom: 1rem; border-bottom: 2px solid transparent; }
        .custom-tabs .nav-link:hover { color: var(--text-light); }
        .custom-tabs .nav-link.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
        .hover-bg-light:hover { background-color: rgba(255,255,255,0.05); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </>
  );
};

export default ClubDetail;
