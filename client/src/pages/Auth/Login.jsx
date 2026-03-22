import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100" style={{ marginTop: '-80px' }}>
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={5} xl={4}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-4 p-md-5"
          >
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2">Welcome Back</h2>
              <p className="text-secondary">Sign in to manage your campus events</p>
            </div>

            {error && <Alert variant="danger" className="py-2 border-0 bg-danger bg-opacity-10 text-danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email Address</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="name@college.edu" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="password">
                <div className="d-flex justify-content-between">
                  <Form.Label>Password</Form.Label>
                  <Link to="#" className="text-primary small text-decoration-none">Forgot password?</Link>
                </div>
                <Form.Control 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 btn-primary-custom mb-4"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Form>

            <div className="text-center text-secondary small">
              Don't have an account? <Link to="/register" className="text-primary fw-medium text-decoration-none">Create Account</Link>
            </div>
          </motion.div>

          <div className="text-center mt-4">
            <p className="text-secondary small mb-1">Demo Credentials:</p>
            <p className="text-secondary small mb-0">Admin: admin@college.edu / admin123</p>
            <p className="text-secondary small">Student: amit@college.edu / pass123</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
