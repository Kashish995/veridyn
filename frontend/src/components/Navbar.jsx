import { Link, useLocation } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard" className="brand-link">
            <span className="brand-icon">✨</span>
            <span className="brand-text">Veridyn</span>
          </Link>
        </div>

        <div className="navbar-links">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/tasks" 
            className={`nav-link ${isActive('/tasks') ? 'active' : ''}`}
          >
            <span className="nav-icon">📝</span>
            <span>Tasks</span>
          </Link>

          <Link 
            to="/insights" 
            className={`nav-link ${isActive('/insights') ? 'active' : ''}`}
          >
            <span className="nav-icon">🤖</span>
            <span>Insights</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;