import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar glass-panel" style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <BookOpen color="var(--primary)" size={32} />
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>EduConnect</h1>
      </div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/')}`}>Browse Courses</Link>
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>My Dashboard</Link>
        <Link to="/manage-courses" className={`nav-link ${isActive('/manage-courses')}`}>⚙ Admin Manage</Link>
      </div>
    </nav>
  );
};

export default Navbar;
