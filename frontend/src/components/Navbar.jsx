import { Link, useLocation } from 'react-router-dom';
import ProfilePanel from './ProfilePanel';
import '../styles/navbar.css';
import '../styles/profilePanel.css';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '▦', label: 'Dashboard' },
  { path: '/tasks',     icon: '◈', label: 'Tasks'     },
  { path: '/insights',  icon: '◎', label: 'Insights'  },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <aside className="sidebar">

      {/* ── Brand (desktop only) ── */}
      <div className="sidebar-brand">
        <div className="brand-mark">
          <span className="brand-mark-inner">V</span>
        </div>
        <div>
          <div className="brand-name">VERIDYN</div>
          <div className="brand-tagline">Intelligence</div>
        </div>
      </div>

      {/* ── AI Status (desktop only) ── */}
      <div className="sidebar-status">
        <span className="glow-dot" />
        <span className="status-text">AI Active</span>
      </div>

      {/* ── Navigation links ── */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>

        {NAV_ITEMS.map(({ path, icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`sidebar-link ${active ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{icon}</span>
              <span className="sidebar-label">{label}</span>
              {active && <span className="active-pip" />}
            </Link>
          );
        })}

        {/* ── Profile button — mobile bottom bar only ── */}
        <div className="sidebar-profile-mobile">
          <ProfilePanel />
        </div>
      </nav>

      {/* ── Footer: profile trigger — desktop only ── */}
      <div className="sidebar-footer">
        <div className="sidebar-divider" />
        <ProfilePanel />
      </div>

    </aside>
  );
}
