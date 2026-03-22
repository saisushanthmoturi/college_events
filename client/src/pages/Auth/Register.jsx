import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    year: '1st Year'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      // By default registering as participant
      const dataToSubmit = { ...formData, role: 'participant' };
      delete dataToSubmit.confirmPassword;
      
      await register(dataToSubmit);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100 py-5" style={{ marginTop: '-50px' }}>
      <Row className="w-100 justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-4 p-md-5"
          >
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2">Create Account</h2>
              <p className="text-secondary">Join CampusSync to start registering for events</p>
            </div>

            {error && <Alert variant="danger" className="py-2 border-0 bg-danger bg-opacity-10 text-danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="name"
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>College Email Address</Form.Label>
                <Form.Control 
                  type="email" 
                  name="email"
                  placeholder="student@college.edu" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Row className="mb-3">
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>Department (Optional)</Form.Label>
                    <Form.Select name="department" value={formData.department} onChange={handleChange}>
                      <option value="">Select...</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Tech">Information Tech</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                      <option value="Business">Business</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>Year (Optional)</Form.Label>
                    <Form.Select name="year" value={formData.year} onChange={handleChange}>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Alumni">Alumni</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col sm={6}>
                  <Form.Group className="mb-3 mb-sm-0">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      name="password"
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>Confirm</Form.Label>
                    <Form.Control 
                      type="password" 
                      name="confirmPassword"
                      placeholder="••••••••" 
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 btn-primary-custom mb-3"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Form>

            <div className="text-center text-secondary small">
              Already have an account? <Link to="/login" className="text-primary fw-medium text-decoration-none">Sign In</Link>
            </div>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
