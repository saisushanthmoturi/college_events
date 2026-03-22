import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Layout/ProtectedRoute';

// Pages - Auth
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Pages - Public
import Landing from './pages/Public/Landing';
import Events from './pages/Events/Events';
import EventDetail from './pages/Events/EventDetail';
import Clubs from './pages/Clubs/Clubs';
import ClubDetail from './pages/Clubs/ClubDetail';

// Pages - Private User
import Dashboard from './pages/Dashboard/Dashboard';
import MyRegistrations from './pages/Dashboard/MyRegistrations';
import Notifications from './pages/Dashboard/Notifications';

// Pages - Admin
import AdminEvents from './pages/Admin/AdminEvents';
import AdminUsers from './pages/Admin/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main Layout containing Navbar & Footer */}
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/clubs/:id" element={<ClubDetail />} />

            {/* Protected Routes (Any logged in user) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-registrations" element={<MyRegistrations />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            {/* Protected Routes (Admin) */}
            <Route element={<ProtectedRoute roles={['superadmin', 'clubadmin', 'club_president', 'club_vp']} />}>
              <Route path="/admin/events" element={<AdminEvents />} />
            </Route>
            
            {/* Protected Routes (Super Admin) */}
            <Route element={<ProtectedRoute roles={['superadmin']} />}>
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
            
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
