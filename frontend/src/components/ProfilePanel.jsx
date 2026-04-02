import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/profilePanel.css';

const SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: '◎', label: 'My Profile',        desc: 'View and edit your profile',       id: 'profile'   },
      { icon: '◈', label: 'Account Settings',  desc: 'Email, password, security',         id: 'settings'  },
      { icon: '▦', label: 'Preferences',       desc: 'Timezone, language, display',       id: 'prefs'     },
    ]
  },
  {
    title: 'Navigate',
    items: [
      { icon: '↗', label: 'Dashboard',         desc: 'Performance overview',              id: 'nav-dash',  route: '/dashboard' },
      { icon: '◷', label: 'Tasks',             desc: 'Manage your tasks',                 id: 'nav-tasks', route: '/tasks'     },
      { icon: '✦', label: 'Insights Hub',      desc: 'AI analytics and predictions',      id: 'nav-ins',   route: '/insights'  },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: '?', label: 'Help Center',       desc: 'Docs, guides, FAQs',                id: 'help'      },
      { icon: '★', label: "What's New",        desc: 'Latest features and updates',       id: 'whats-new' },
      { icon: '⌘', label: 'Keyboard Shortcuts',desc: 'Power-user shortcuts',              id: 'shortcuts' },
    ]
  }
];

const SHORTCUTS = [
  { keys: ['G','D'], desc: 'Go to Dashboard'   },
  { keys: ['G','T'], desc: 'Go to Tasks'        },
  { keys: ['G','I'], desc: 'Go to Insights'     },
  { keys: ['?'],     desc: 'Toggle this panel'  },
  { keys: ['Esc'],   desc: 'Close panel'        },
];

export default function ProfilePanel() {
  const [open,    setOpen]    = useState(false);
  const [subView, setSubView] = useState(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const user     = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const initials = (user?.email || 'KA').slice(0, 2).toUpperCase();
  const email    = user?.email || 'user@veridyn.app';

  /* ── Close on outside click ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        closePanelFull();
      }
    };
    // Small delay so the open-click doesn't immediately close
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [open]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { closePanelFull(); return; }
      if (e.key === '?' && !['INPUT','TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        setOpen(o => { if (!o) setSubView(null); return !o; });
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const closePanelFull = () => {
    setOpen(false);
    setTimeout(() => setSubView(null), 280); // wait for animation
  };

  const handleItem = (item) => {
    if (item.route) {
      navigate(item.route);
      closePanelFull();
      return;
    }
    if (['help','whats-new','shortcuts'].includes(item.id)) {
      setSubView(item.id);
      return;
    }
    closePanelFull();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>
      {/* ── Trigger: user row at bottom of sidebar ── */}
      <button
        className="pp-trigger"
        onClick={() => { setOpen(o => { if (!o) setSubView(null); return !o; }); }}
        aria-label="Open profile"
        aria-expanded={open}
      >
        <div className="pp-trigger-avatar">{initials}</div>
        <div className="pp-trigger-info">
          <span className="pp-trigger-email">{email}</span>
          <span className="pp-trigger-role">Student</span>
        </div>
        <span className="pp-trigger-caret" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          ⌃
        </span>
      </button>

      {/* ── Backdrop ── */}
      <div
        className={`pp-backdrop ${open ? 'pp-backdrop--visible' : ''}`}
        onClick={closePanelFull}
        aria-hidden="true"
      />

      {/* ── Right-side panel ── */}
      <div
        ref={panelRef}
        className={`pp-panel ${open ? 'pp-panel--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Profile panel"
      >

        {/* ══ Main view ══ */}
        <div className={`pp-view ${!subView ? 'pp-view--active' : 'pp-view--hidden'}`}>

          {/* Header */}
          <div className="pp-header">
            <div className="pp-header-user">
              <div className="pp-header-avatar">{initials}</div>
              <div>
                <div className="pp-header-email">{email}</div>
                <div className="pp-header-joined">Veridyn Intelligence</div>
              </div>
            </div>
            <button
              className="pp-close-btn"
              onClick={closePanelFull}
              aria-label="Close panel"
              type="button"
            >
              ✕
            </button>
          </div>

          {/* AI status */}
          <div className="pp-ai-pill">
            <span className="pp-ai-dot" />
            AI Intelligence Active
            <span className="pp-ai-ver">v2.0</span>
          </div>

          {/* Menu sections */}
          <nav className="pp-nav">
            {SECTIONS.map(section => (
              <div key={section.title} className="pp-section">
                <div className="pp-section-label">{section.title}</div>
                {section.items.map(item => (
                  <button
                    key={item.id}
                    className="pp-item"
                    onClick={() => handleItem(item)}
                    type="button"
                  >
                    <span className="pp-item-icon">{item.icon}</span>
                    <span className="pp-item-body">
                      <span className="pp-item-label">{item.label}</span>
                      <span className="pp-item-desc">{item.desc}</span>
                    </span>
                    <span className="pp-item-arrow">›</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="pp-footer">
            <div className="pp-footer-meta">
              <span className="pp-ver-tag">Veridyn v2.0</span>
              <span className="pp-kbd-hint">Press <kbd>?</kbd> anytime</span>
            </div>
            <button className="pp-logout-btn" onClick={logout} type="button">
              <span>↗</span> Sign out
            </button>
          </div>

        </div>

        {/* ══ Sub-view: Shortcuts ══ */}
        <div className={`pp-view ${subView === 'shortcuts' ? 'pp-view--active' : 'pp-view--hidden'}`}>
          <div className="pp-subheader">
            <button className="pp-back-btn" onClick={() => setSubView(null)} type="button">‹ Back</button>
            <span className="pp-subheader-title">Keyboard Shortcuts</span>
          </div>
          <div className="pp-shortcuts-list">
            {SHORTCUTS.map((s, i) => (
              <div key={i} className="pp-shortcut-row">
                <div className="pp-shortcut-keys">
                  {s.keys.map((k, j) => <kbd key={j} className="pp-kbd">{k}</kbd>)}
                </div>
                <span className="pp-shortcut-desc">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ Sub-view: What's New ══ */}
        <div className={`pp-view ${subView === 'whats-new' ? 'pp-view--active' : 'pp-view--hidden'}`}>
          <div className="pp-subheader">
            <button className="pp-back-btn" onClick={() => setSubView(null)} type="button">‹ Back</button>
            <span className="pp-subheader-title">What's New</span>
          </div>
          <div className="pp-changelog">
            {[
              { tag: 'New',      date: 'Apr 2026', title: 'Dark Intelligence UI',       desc: 'Redesigned dark dashboard with sidebar and profile panel.' },
              { tag: 'Feature',  date: 'Mar 2026', title: 'AI Risk Predictor',          desc: 'Predicts productivity drops using behavioral pattern analysis.' },
              { tag: 'Improved', date: 'Mar 2026', title: 'Study Pattern Analyzer',    desc: 'Detects best and worst performance hours automatically.' },
              { tag: 'Feature',  date: 'Feb 2026', title: 'AI Chat Coach',             desc: 'Groq-powered coach with your live data context. Free & fast.' },
            ].map((r, i) => (
              <div key={i} className="pp-release">
                <div className="pp-release-meta">
                  <span className={`pp-release-tag pp-tag-${r.tag.toLowerCase()}`}>{r.tag}</span>
                  <span className="pp-release-date">{r.date}</span>
                </div>
                <div className="pp-release-title">{r.title}</div>
                <div className="pp-release-desc">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ Sub-view: Help ══ */}
        <div className={`pp-view ${subView === 'help' ? 'pp-view--active' : 'pp-view--hidden'}`}>
          <div className="pp-subheader">
            <button className="pp-back-btn" onClick={() => setSubView(null)} type="button">‹ Back</button>
            <span className="pp-subheader-title">Help Center</span>
          </div>
          <div className="pp-help-list">
            {[
              { q: 'How is my Discipline Score calculated?',   a: '(Completed tasks ÷ Total tasks) × 100. Complete more tasks daily to raise it.' },
              { q: 'What are the Performance Tiers?',          a: 'Elite 85%+, Gold 70–84%, Silver 50–69%, Bronze <50%. Based on your daily completion rate.' },
              { q: 'How does the Risk Predictor work?',        a: 'Analyzes streak, completion rate, volatility, and trend to predict productivity drops.' },
              { q: 'What is Volatility?',                      a: 'Standard deviation of your discipline scores. High = inconsistent. Low = stable patterns.' },
              { q: 'How do I maintain my streak?',             a: 'Complete at least one task every day. Even 1 task/day keeps the streak alive.' },
            ].map((item, i) => (
              <div key={i} className="pp-help-item">
                <div className="pp-help-q">{item.q}</div>
                <div className="pp-help-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
