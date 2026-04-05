import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/profilePanel.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

// ── Reusable small components ─────────────────────────────────

const StatusMsg = ({ type, msg }) => {
  if (!msg) return null;
  const color = type === 'success' ? '#48c78e' : '#ef4444';
  return (
    <div style={{
      padding: '10px 14px', borderRadius: '8px', fontSize: '12px',
      background: type === 'success' ? 'rgba(72,199,142,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${color}20`, color, marginBottom: '12px'
    }}>
      {type === 'success' ? '✓ ' : '✕ '}{msg}
    </div>
  );
};

const SubHeader = ({ title, onBack }) => (
  <div className="pp-subheader">
    <button className="pp-back-btn" onClick={onBack} type="button">‹ Back</button>
    <span className="pp-subheader-title">{title}</span>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
      {label}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
  color: '#e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const SaveBtn = ({ loading, label = 'Save Changes', onClick }) => (
  <button
    onClick={onClick}
    disabled={loading}
    type="button"
    style={{
      width: '100%', padding: '11px', background: loading ? 'rgba(74,158,255,0.4)' : '#4a9eff',
      border: 'none', borderRadius: '9px', color: '#0f1923', fontSize: '13px',
      fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.5px',
      marginTop: '4px',
    }}
  >
    {loading ? 'Saving…' : label}
  </button>
);

// ── Sub-view: My Profile ──────────────────────────────────────
function ProfileView({ user, onBack, onUpdate }) {
  const [name,    setName]    = useState(user?.name    || '');
  const [role,    setRole]    = useState(user?.role    || 'Student');
  const [loading, setLoading] = useState(false);
  const [status,  setStatus]  = useState(null); // { type, msg }

  const save = async () => {
    setLoading(true); setStatus(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API}/api/users/profile`,
        { name, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update localStorage so trigger row refreshes
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name, role }));
      setStatus({ type: 'success', msg: 'Profile updated successfully!' });
      onUpdate?.({ name, role });
    } catch (err) {
      setStatus({ type: 'error', msg: err?.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0 20px 24px' }}>
      <StatusMsg {...(status || {})} msg={status?.msg} />

      {/* Avatar display */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #4a9eff, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', fontWeight: '700', color: '#fff', margin: '0 auto 8px',
        }}>
          {(user?.name || user?.email || 'KA').slice(0, 2).toUpperCase()}
        </div>
        <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>
          {user?.email}
        </p>
      </div>

      <Field label="Display Name">
        <input
          style={inputStyle}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
        />
      </Field>

      <Field label="Role / Title">
        <select
          style={{ ...inputStyle, cursor: 'pointer' }}
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          {['Student', 'Developer', 'Designer', 'Researcher', 'Entrepreneur', 'Other'].map(r => (
            <option key={r} value={r} style={{ background: '#1a2332' }}>{r}</option>
          ))}
        </select>
      </Field>

      <Field label="Email">
        <input style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} value={user?.email || ''} disabled />
        <p style={{ color: '#475569', fontSize: '11px', margin: '4px 0 0' }}>
          Change email in Account Settings
        </p>
      </Field>

      <SaveBtn loading={loading} onClick={save} />
    </div>
  );
}

// ── Sub-view: Account Settings ────────────────────────────────
function SettingsView({ user, onBack }) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [status,    setStatus]    = useState(null);

  const save = async () => {
    if (!currentPw || !newPw) return setStatus({ type: 'error', msg: 'Please fill in all fields.' });
    if (newPw !== confirmPw)   return setStatus({ type: 'error', msg: 'New passwords do not match.' });
    if (newPw.length < 6)      return setStatus({ type: 'error', msg: 'Password must be at least 6 characters.' });

    setLoading(true); setStatus(null);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/api/users/change-password`,
        { currentPassword: currentPw, newPassword: newPw },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus({ type: 'success', msg: 'Password changed successfully!' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setStatus({ type: 'error', msg: err?.response?.data?.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0 20px 24px' }}>
      <StatusMsg {...(status || {})} msg={status?.msg} />

      <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '20px' }}>
        Signed in as <span style={{ color: '#94a3b8' }}>{user?.email}</span>
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px', padding: '16px', marginBottom: '20px'
      }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', margin: '0 0 14px', letterSpacing: '0.5px' }}>
          🔑 Change Password
        </p>
        <Field label="Current Password">
          <input style={inputStyle} type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" />
        </Field>
        <Field label="New Password">
          <input style={inputStyle} type="password" value={newPw}     onChange={e => setNewPw(e.target.value)}     placeholder="••••••••" />
        </Field>
        <Field label="Confirm New Password">
          <input style={inputStyle} type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" />
        </Field>
        <SaveBtn loading={loading} label="Change Password" onClick={save} />
      </div>

      {/* Danger Zone */}
      <div style={{
        background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
        borderRadius: '12px', padding: '16px'
      }}>
        <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600', margin: '0 0 8px' }}>⚠ Danger Zone</p>
        <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 12px' }}>
          Deleting your account is permanent and cannot be undone.
        </p>
        <button
          type="button"
          style={{
            width: '100%', padding: '10px', background: 'transparent',
            border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px',
            color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit'
          }}
          onClick={() => {
            if (window.confirm('Are you sure? This cannot be undone.')) {
              alert('Contact support to delete your account.');
            }
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

// ── Sub-view: Preferences ─────────────────────────────────────
function PrefsView({ onBack }) {
  const stored = (() => { try { return JSON.parse(localStorage.getItem('veridyn_prefs') || '{}'); } catch { return {}; } })();

  const [goalHours, setGoalHours] = useState(stored.goalHours || 2);
  const [timezone,  setTimezone]  = useState(stored.timezone  || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [theme,     setTheme]     = useState(stored.theme     || 'dark');
  const [saved,     setSaved]     = useState(false);

  const save = () => {
    const prefs = { goalHours, timezone, theme };
    localStorage.setItem('veridyn_prefs', JSON.stringify(prefs));
    // Dispatch event so other components (like StudyTimer) can react
    window.dispatchEvent(new CustomEvent('veridyn-prefs-updated', { detail: prefs }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const timezones = [
    'Asia/Kolkata', 'UTC', 'America/New_York', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'
  ];

  return (
    <div style={{ padding: '0 20px 24px' }}>
      {saved && <StatusMsg type="success" msg="Preferences saved!" />}

      <Field label="Daily Study Goal">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="range" min="0.5" max="12" step="0.5"
            value={goalHours}
            onChange={e => setGoalHours(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#4a9eff' }}
          />
          <span style={{
            minWidth: '52px', textAlign: 'center', color: '#4a9eff',
            fontSize: '14px', fontWeight: '700',
            background: 'rgba(74,158,255,0.1)', padding: '4px 8px',
            borderRadius: '6px', border: '1px solid rgba(74,158,255,0.2)'
          }}>
            {goalHours}h
          </span>
        </div>
        <p style={{ color: '#475569', fontSize: '11px', margin: '6px 0 0' }}>
          Goal = {goalHours * 60} min/day — drives your heatmap & streaks
        </p>
      </Field>

      <Field label="Timezone">
        <select
          style={{ ...inputStyle, cursor: 'pointer' }}
          value={timezone}
          onChange={e => setTimezone(e.target.value)}
        >
          {timezones.map(tz => (
            <option key={tz} value={tz} style={{ background: '#1a2332' }}>{tz}</option>
          ))}
        </select>
      </Field>

      <Field label="Theme">
        <div style={{ display: 'flex', gap: '8px' }}>
          {['dark', 'light'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              style={{
                flex: 1, padding: '9px', borderRadius: '8px', fontSize: '12px',
                fontFamily: 'inherit', cursor: 'pointer',
                background: theme === t ? '#4a9eff' : 'rgba(255,255,255,0.04)',
                border: theme === t ? 'none' : '1px solid rgba(255,255,255,0.08)',
                color: theme === t ? '#0f1923' : '#94a3b8', fontWeight: theme === t ? '700' : '400',
              }}
            >
              {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
          ))}
        </div>
        {theme === 'light' && (
          <p style={{ color: '#f59e0b', fontSize: '11px', margin: '6px 0 0' }}>
            ⚠ Light theme coming soon — staying dark for now!
          </p>
        )}
      </Field>

      <SaveBtn onClick={save} label="Save Preferences" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function ProfilePanel() {
  const [open,    setOpen]    = useState(false);
  const [subView, setSubView] = useState(null);
  const [userData, setUserData] = useState(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Load user from localStorage
  useEffect(() => {
    try {
      setUserData(JSON.parse(localStorage.getItem('user') || '{}'));
    } catch { setUserData({}); }
  }, [open]); // refresh when panel opens

  const initials = (userData?.name || userData?.email || 'KA').slice(0, 2).toUpperCase();
  const email    = userData?.email || 'user@veridyn.app';
  const role     = userData?.role  || 'Student';

  /* ── Close on outside click ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) closePanelFull();
    };
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
    setTimeout(() => setSubView(null), 280);
  };

  const handleItem = (item) => {
    if (item.route) {
      navigate(item.route);
      closePanelFull();
      return;
    }
    // All IDs now have a sub-view
    setSubView(item.id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Sub-view title map
  const subTitles = {
    profile:   'My Profile',
    settings:  'Account Settings',
    prefs:     'Preferences',
    help:      'Help Center',
    'whats-new': "What's New",
    shortcuts: 'Keyboard Shortcuts',
  };

  return (
    <>
      {/* ── Trigger ── */}
      <button
        className="pp-trigger"
        onClick={() => { setOpen(o => { if (!o) setSubView(null); return !o; }); }}
        aria-label="Open profile"
        aria-expanded={open}
      >
        <div className="pp-trigger-avatar">{initials}</div>
        <div className="pp-trigger-info">
          <span className="pp-trigger-email">{email}</span>
          <span className="pp-trigger-role">{role}</span>
        </div>
        <span className="pp-trigger-caret" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>⌃</span>
      </button>

      {/* ── Backdrop ── */}
      <div
        className={`pp-backdrop ${open ? 'pp-backdrop--visible' : ''}`}
        onClick={closePanelFull}
        aria-hidden="true"
      />

      {/* ── Panel ── */}
      <div
        ref={panelRef}
        className={`pp-panel ${open ? 'pp-panel--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Profile panel"
      >

        {/* ══ Main view ══ */}
        <div className={`pp-view ${!subView ? 'pp-view--active' : 'pp-view--hidden'}`}>
          <div className="pp-header">
            <div className="pp-header-user">
              <div className="pp-header-avatar">{initials}</div>
              <div>
                <div className="pp-header-email">{email}</div>
                <div className="pp-header-joined">Veridyn Intelligence</div>
              </div>
            </div>
            <button className="pp-close-btn" onClick={closePanelFull} aria-label="Close panel" type="button">✕</button>
          </div>

          <div className="pp-ai-pill">
            <span className="pp-ai-dot" />
            AI Intelligence Active
            <span className="pp-ai-ver">v2.0</span>
          </div>

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

        {/* ══ Dynamic sub-views ══ */}
        {subView && (
          <div className="pp-view pp-view--active">
            <SubHeader title={subTitles[subView] || subView} onBack={() => setSubView(null)} />

            {subView === 'profile' && (
              <ProfileView
                user={userData}
                onBack={() => setSubView(null)}
                onUpdate={(updated) => setUserData(u => ({ ...u, ...updated }))}
              />
            )}

            {subView === 'settings' && (
              <SettingsView user={userData} onBack={() => setSubView(null)} />
            )}

            {subView === 'prefs' && (
              <PrefsView onBack={() => setSubView(null)} />
            )}

            {subView === 'shortcuts' && (
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
            )}

            {subView === 'whats-new' && (
              <div className="pp-changelog">
                {[
                  { tag: 'New',      date: 'Apr 2026', title: 'Study Timer + Heatmap',       desc: 'Built-in study timer auto-fills your productivity heatmap daily.' },
                  { tag: 'New',      date: 'Apr 2026', title: 'Dark Intelligence UI',         desc: 'Redesigned dark dashboard with sidebar and profile panel.' },
                  { tag: 'Feature',  date: 'Mar 2026', title: 'AI Risk Predictor',            desc: 'Predicts productivity drops using behavioral pattern analysis.' },
                  { tag: 'Improved', date: 'Mar 2026', title: 'Study Pattern Analyzer',      desc: 'Detects best and worst performance hours automatically.' },
                  { tag: 'Feature',  date: 'Feb 2026', title: 'AI Chat Coach',               desc: 'Groq-powered coach with your live data context. Free & fast.' },
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
            )}

            {subView === 'help' && (
              <div className="pp-help-list">
                {[
                  { q: 'How is my Discipline Score calculated?',  a: '(Completed tasks ÷ Total tasks) × 100. Complete more tasks daily to raise it.' },
                  { q: 'What are the Performance Tiers?',         a: 'Elite 85%+, Gold 70–84%, Silver 50–69%, Bronze <50%. Based on your daily completion rate.' },
                  { q: 'How does the Study Timer work?',          a: 'Start the timer when you study, stop when done. Sessions auto-log to your heatmap.' },
                  { q: 'How does the Risk Predictor work?',       a: 'Analyzes streak, completion rate, volatility, and trend to predict productivity drops.' },
                  { q: 'What is Volatility?',                     a: 'Standard deviation of your discipline scores. High = inconsistent. Low = stable patterns.' },
                  { q: 'How do I maintain my streak?',            a: 'Hit your daily study goal (set in Preferences) every day to keep the streak alive.' },
                ].map((item, i) => (
                  <div key={i} className="pp-help-item">
                    <div className="pp-help-q">{item.q}</div>
                    <div className="pp-help-a">{item.a}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
