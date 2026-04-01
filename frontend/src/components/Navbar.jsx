import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/navbar.css';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '▦', label: 'Dashboard' },
  { path: '/tasks',     icon: '◈', label: 'Tasks'     },
  { path: '/insights',  icon: '◎', label: 'Insights'  },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'VD';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-mark">
          <span className="brand-mark-inner">V</span>
        </div>
        <div>
          <div className="brand-name">VERIDYN</div>
          <div className="brand-tagline">Intelligence</div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="sidebar-status">
        <span className="glow-dot"></span>
        <span className="status-text">AI Active</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {NAV_ITEMS.map(({ path, icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} className={`sidebar-link ${active ? 'active' : ''}`}>
              <span className="sidebar-icon">{icon}</span>
              <span className="sidebar-label">{label}</span>
              {active && <span className="active-pip" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-divider" />
        <div className="user-row">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-email">{user?.email || 'User'}</div>
            <div className="user-role">Student</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span>↗</span> Sign out
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
