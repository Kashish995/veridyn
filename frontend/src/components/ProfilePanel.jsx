import { useState, useEffect, useRef } from 'react';
import '../styles/profilePanel.css';

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: '◎', label: 'My Profile',       desc: 'View and edit your profile',      id: 'profile'  },
      { icon: '◈', label: 'Account Settings', desc: 'Email, password, security',        id: 'settings' },
      { icon: '▦', label: 'Preferences',      desc: 'Timezone, language, display',      id: 'prefs'    },
    ]
  },
  {
    title: 'Dashboard',
    items: [
      { icon: '↗', label: 'Insights Hub',     desc: 'AI analytics and predictions',     id: 'insights', route: '/insights' },
      { icon: '◷', label: 'Task History',     desc: 'View all past tasks',              id: 'history'  },
      { icon: '▸', label: 'Weekly Goals',     desc: 'Set and track weekly objectives',  id: 'goals'    },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: '?', label: 'Help Center',      desc: 'Docs, guides, FAQs',               id: 'help'     },
      { icon: '✦', label: 'What\'s New',      desc: 'Latest features and updates',      id: 'whats-new'},
      { icon: '⌘', label: 'Keyboard Shortcuts', desc: 'Power-user shortcuts',           id: 'shortcuts'},
    ]
  }
];

const SHORTCUTS = [
  { keys: ['G', 'D'], desc: 'Go to Dashboard'  },
  { keys: ['G', 'T'], desc: 'Go to Tasks'       },
  { keys: ['G', 'I'], desc: 'Go to Insights'    },
  { keys: ['N'],      desc: 'New Task'           },
  { keys: ['?'],      desc: 'Open this panel'    },
];

export default function ProfilePanel() {
  const [open,       setOpen]       = useState(false);
  const [activeView, setActiveView] = useState(null); // null = main menu
  const panelRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = user?.email?.slice(0,2).toUpperCase() || 'KA';
  const joinDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        setActiveView(null);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '?' && !e.target.matches('input, textarea')) {
        setOpen(o => !o);
      }
      if (e.key === 'Escape') { setOpen(false); setActiveView(null); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleItem = (item) => {
    if (item.route) {
      window.location.href = item.route;
      setOpen(false);
      return;
    }
    if (item.id === 'shortcuts') { setActiveView('shortcuts'); return; }
    if (item.id === 'whats-new') { setActiveView('whats-new'); return; }
    if (item.id === 'help')      { setActiveView('help');      return; }
    // Others: show coming-soon toast (just close for now)
    setOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Trigger — sitting in sidebar footer via CSS class */}
      <button
        className="profile-trigger"
        onClick={() => { setOpen(o => !o); setActiveView(null); }}
        aria-label="Open profile panel"
      >
        <div className="profile-trigger-avatar">{initials}</div>
        <div className="profile-trigger-info">
          <span className="profile-trigger-name">{user?.email || 'User'}</span>
          <span className="profile-trigger-role">Student</span>
        </div>
        <span className="profile-trigger-caret">{open ? '▴' : '▾'}</span>
      </button>

      {/* Backdrop */}
      {open && <div className="profile-backdrop" onClick={() => setOpen(false)} />}

      {/* Slide panel */}
      <div ref={panelRef} className={`profile-panel ${open ? 'open' : ''}`}>

        {/* ── Inner: Main menu ── */}
        <div className={`panel-view ${!activeView ? 'visible' : 'hidden'}`}>

          {/* User hero */}
          <div className="panel-hero">
            <div className="panel-hero-avatar">{initials}</div>
            <div className="panel-hero-info">
              <div className="panel-hero-name">{user?.email || 'User'}</div>
              <div className="panel-hero-sub">Joined {joinDate}</div>
            </div>
            <button className="panel-close-btn" onClick={() => setOpen(false)}>×</button>
          </div>

          {/* AI status chip */}
          <div className="panel-ai-chip">
            <span className="panel-ai-dot" />
            <span>AI Intelligence Active</span>
            <span className="panel-ai-version">v2.0</span>
          </div>

          {/* Sections */}
          <div className="panel-sections">
            {MENU_SECTIONS.map(section => (
              <div key={section.title} className="panel-section">
                <div className="panel-section-title">{section.title}</div>
                {section.items.map(item => (
                  <button
                    key={item.id}
                    className="panel-item"
                    onClick={() => handleItem(item)}
                  >
                    <div className="panel-item-icon">{item.icon}</div>
                    <div className="panel-item-text">
                      <span className="panel-item-label">{item.label}</span>
                      <span className="panel-item-desc">{item.desc}</span>
                    </div>
                    <span className="panel-item-arrow">›</span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="panel-footer">
            <div className="panel-footer-row">
              <span className="panel-version">Veridyn v2.0</span>
              <span className="panel-shortcut-hint">Press <kbd>?</kbd> anytime</span>
            </div>
            <button className="panel-logout-btn" onClick={logout}>
              <span>↗</span> Sign out
            </button>
          </div>
        </div>

        {/* ── Inner: Keyboard Shortcuts ── */}
        <div className={`panel-view ${activeView === 'shortcuts' ? 'visible' : 'hidden'}`}>
          <div className="panel-sub-header">
            <button className="panel-back-btn" onClick={() => setActiveView(null)}>‹ Back</button>
            <div className="panel-sub-title">Keyboard Shortcuts</div>
          </div>
          <div className="panel-shortcuts">
            {SHORTCUTS.map((s, i) => (
              <div key={i} className="shortcut-row">
                <div className="shortcut-keys">
                  {s.keys.map((k, j) => <kbd key={j} className="shortcut-key">{k}</kbd>)}
                </div>
                <span className="shortcut-desc">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Inner: What's New ── */}
        <div className={`panel-view ${activeView === 'whats-new' ? 'visible' : 'hidden'}`}>
          <div className="panel-sub-header">
            <button className="panel-back-btn" onClick={() => setActiveView(null)}>‹ Back</button>
            <div className="panel-sub-title">What's New</div>
          </div>
          <div className="panel-whats-new">
            {[
              { version: 'v2.0', date: 'Apr 2026', tag: 'New',       title: 'Dark Intelligence UI', desc: 'Completely redesigned dark dashboard with sidebar navigation.' },
              { version: 'v1.9', date: 'Mar 2026', tag: 'Feature',   title: 'AI Risk Predictor',    desc: 'Predicts productivity drops using behavioral pattern analysis.' },
              { version: 'v1.8', date: 'Mar 2026', tag: 'Improved',  title: 'Study Pattern Analyzer', desc: 'Now detects your best and worst performance hours.' },
              { version: 'v1.7', date: 'Feb 2026', tag: 'Feature',   title: 'AI Chat Coach',        desc: 'Real-time GPT-powered coach with your data context.' },
            ].map((r, i) => (
              <div key={i} className="release-row">
                <div className="release-meta">
                  <span className={`release-tag tag-${r.tag.toLowerCase()}`}>{r.tag}</span>
                  <span className="release-date">{r.date}</span>
                </div>
                <div className="release-title">{r.title}</div>
                <div className="release-desc">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Inner: Help Center ── */}
        <div className={`panel-view ${activeView === 'help' ? 'visible' : 'hidden'}`}>
          <div className="panel-sub-header">
            <button className="panel-back-btn" onClick={() => setActiveView(null)}>‹ Back</button>
            <div className="panel-sub-title">Help Center</div>
          </div>
          <div className="panel-help">
            {[
              { icon: '◎', q: 'How is my Discipline Score calculated?',  a: 'It\'s (completed tasks / total tasks) × 100. Complete more tasks each day to raise your score.' },
              { icon: '◈', q: 'What do the Tiers mean?',                a: 'Elite (85%+), Gold (70–84%), Silver (50–69%), Bronze (<50%). Tier is based on your daily completion rate.' },
              { icon: '▦', q: 'How does the Risk Predictor work?',      a: 'It analyzes your streak, completion rate, volatility, and trend to predict if your productivity will drop.' },
              { icon: '◷', q: 'What is Volatility?',                    a: 'Standard deviation of your discipline scores. High volatility = inconsistent performance.' },
              { icon: '↗', q: 'How do I improve my streak?',            a: 'Complete at least one task every day. Even 1 task/day keeps your streak alive.' },
            ].map((item, i) => (
              <div key={i} className="help-item">
                <div className="help-icon">{item.icon}</div>
                <div>
                  <div className="help-q">{item.q}</div>
                  <div className="help-a">{item.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
