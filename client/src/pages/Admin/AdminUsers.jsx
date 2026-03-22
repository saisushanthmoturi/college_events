import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, Spinner } from 'react-bootstrap';
import { FaUserShield, FaUserGraduate, FaUserTie } from 'react-icons/fa';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      const query = searchTerm ? `/users?search=${searchTerm}` : '/users';
      const res = await api.get(query);
      setUsers(res.data.users);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole, userName) => {
    const result = await Swal.fire({
      title: 'Change Role?',
      text: `Are you sure you want to change ${userName}'s role to ${newRole}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7aa2f7',
      cancelButtonColor: '#565f89',
      background: '#1a1b26',
      color: '#c0caf5'
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/users/${userId}/role`, { role: newRole });
        Swal.fire({ title: 'Updated!', icon: 'success', timer: 1500, showConfirmButton: false, background: '#1a1b26', color: '#c0caf5' });
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to update role', 'error');
      }
    }
  };

  const getRoleBadge = (role) => {
    const map = {
      superadmin: { bg: 'danger', icon: <FaUserShield className="me-1" /> },
      clubadmin: { bg: 'warning', icon: <FaUserTie className="me-1" /> },
      participant: { bg: 'info', icon: <FaUserGraduate className="me-1" /> }
    };
    const config = map[role] || map.participant;
    return <Badge bg={config.bg} className="d-flex align-items-center text-dark px-2 py-1 fit-content">{config.icon} {role}</Badge>;
  };

  if (loading && users.length === 0) return <div className="text-center py-5 vh-100"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container className="py-5 animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        <div>
          <h1 className="fw-bold display-6 mb-1">User Management</h1>
          <p className="text-secondary mb-0">Control roles, access, and permissions across the platform.</p>
        </div>
        <div style={{ maxWidth: '300px', width: '100%' }}>
          <Form.Control
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-dark border-secondary bg-opacity-50 text-light rounded-pill px-4 shadow-none"
          />
        </div>
      </div>

      <Card className="glass-panel border-0 rounded-4 overflow-hidden p-0 mb-4">
        <div className="table-responsive p-0">
          <Table hover variant="dark" className="mb-0 custom-table align-middle">
            <thead>
              <tr className="bg-dark bg-opacity-50 text-secondary small text-uppercase">
                <th className="ps-4 fw-medium border-secondary border-opacity-25 py-3">User Details</th>
                <th className="fw-medium border-secondary border-opacity-25 py-3">Contact</th>
                <th className="fw-medium border-secondary border-opacity-25 py-3">Current Role</th>
                <th className="pe-4 fw-medium border-secondary border-opacity-25 py-3 text-end" style={{ width: '200px' }}>Modify Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-5 text-secondary border-0">No users found.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u._id} className="border-secondary border-opacity-10">
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-secondary d-flex justify-content-center align-items-center text-light me-3 flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold text-light mb-0">{u.name}</div>
                          <div className="small text-secondary">{u.department || 'No department'} • {u.year || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-light small">
                      {u.email}
                      <div className="text-secondary mt-1">{u.phone || '-'}</div>
                    </td>
                    <td className="py-3">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="pe-4 py-3 text-end">
                      <Form.Select 
                         size="sm" 
                         className="bg-dark border-secondary text-light w-100 fs-7 px-2"
                         value={u.role}
                         onChange={(e) => handleRoleChange(u._id, e.target.value, u.name)}
                         disabled={u.email === 'admin@college.edu'} // Prevent changing main admin
                      >
                         <option value="participant">Participant</option>
                         <option value="clubadmin">Club Admin</option>
                         <option value="superadmin">Super Admin</option>
                      </Form.Select>
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
        .fit-content { width: fit-content; }
        .fs-7 { font-size: 0.85rem; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </Container>
  );
};

export default AdminUsers;
