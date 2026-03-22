import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="mt-auto pt-5 pb-4" style={{ backgroundColor: '#090a0f', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <Container>
        <Row className="gy-4 mb-4">
          <Col lg={4} md={6}>
            <h4 className="fw-bold mb-3 d-flex align-items-center">
              <span className="me-2" style={{ color: 'var(--primary-color)' }}>❖</span>
              CampusSync
            </h4>
            <p className="text-secondary pe-lg-4 mb-4">
              The premier platform for discovering, organizing, and managing college events and club activities seamlessly.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-secondary hover-primary"><FaTwitter size={20} /></a>
              <a href="#" className="text-secondary hover-primary"><FaInstagram size={20} /></a>
              <a href="#" className="text-secondary hover-primary"><FaLinkedin size={20} /></a>
              <a href="#" className="text-secondary hover-primary"><FaGithub size={20} /></a>
            </div>
          </Col>
          
          <Col lg={2} md={6}>
            <h5 className="text-light mb-3 fw-semibold">Platform</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><Link to="/events" className="text-secondary text-decoration-none hover-light">Browse Events</Link></li>
              <li><Link to="/clubs" className="text-secondary text-decoration-none hover-light">Explore Clubs</Link></li>
              <li><Link to="/dashboard" className="text-secondary text-decoration-none hover-light">My Dashboard</Link></li>
              <li><Link to="/auth/help" className="text-secondary text-decoration-none hover-light">Help Center</Link></li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h5 className="text-light mb-3 fw-semibold">Legal</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><Link to="#" className="text-secondary text-decoration-none hover-light">Terms of Service</Link></li>
              <li><Link to="#" className="text-secondary text-decoration-none hover-light">Privacy Policy</Link></li>
              <li><Link to="#" className="text-secondary text-decoration-none hover-light">Cookie Policy</Link></li>
              <li><Link to="#" className="text-secondary text-decoration-none hover-light">Refund Policy</Link></li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h5 className="text-light mb-3 fw-semibold">Subscribe</h5>
            <p className="text-secondary small mb-3">Get the latest updates on major campus events</p>
            <div className="d-flex">
              <input type="email" placeholder="Email address" className="form-control rounded-end-0 border-secondary bg-transparent text-light" />
              <button className="btn btn-primary rounded-start-0 border-0" style={{ backgroundColor: 'var(--primary-color)' }}>Top</button>
            </div>
          </Col>
        </Row>

        <hr className="border-secondary opacity-25" />
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pt-2">
          <p className="text-secondary small mb-0">
            &copy; {new Date().getFullYear()} CampusSync. All rights reserved.
          </p>
          <p className="text-secondary small mb-0 mt-2 mt-md-0 d-flex align-items-center">
            Made with <FaHeart className="text-danger mx-1" size={12} /> for College Students
          </p>
        </div>
      </Container>
      <style>{`
        .hover-primary:hover { color: var(--primary-color) !important; transition: color 0.2s; }
        .hover-light:hover { color: #fff !important; transition: color 0.2s; }
      `}</style>
    </footer>
  );
};

export default Footer;
