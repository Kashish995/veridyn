import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import '../styles/auth.css';

/* ── Animated neural-network canvas background ──────────────
   Drifting nodes that connect with lines when close together,
   colored with the brand indigo/cyan palette. Purely decorative,
   sits behind the left panel content. Respects prefers-reduced-motion. */
function NeuralNetworkCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width, height, dpr;
    let nodes = [];
    let animationId;
    let t = 0;

    const NODE_COUNT = 34;
    const LINK_DIST = 150;
    const COLORS = ['99,102,241', '6,182,212', '129,140,248']; // indigo / cyan / indigo-light

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1.4 + Math.random() * 1.8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulseOffset: Math.random() * Math.PI * 2,
      }));
    }

    function step() {
      t += 0.016;
      ctx.clearRect(0, 0, width, height);

      // update positions
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.35;
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes (with gentle pulse)
      for (const n of nodes) {
        const pulse = 0.6 + Math.sin(t * 1.5 + n.pulseOffset) * 0.4;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${n.color},${0.5 + pulse * 0.5})`;
        ctx.arc(n.x, n.y, n.r * (0.85 + pulse * 0.3), 0, Math.PI * 2);
        ctx.fill();

        // soft glow
        ctx.beginPath();
        ctx.fillStyle = `rgba(${n.color},${0.06 + pulse * 0.05})`;
        ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(step);
    }

    resize();
    initNodes();

    if (prefersReducedMotion) {
      step(); // draw a single static frame, no rAF loop
    } else {
      step();
    }

    const handleResize = () => { resize(); initNodes(); };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="auth-panel-canvas" />;
}

/* ── Framer-motion variants ── */
const containerStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setSuccess(true);
      // small delight pause so the success checkmark is visible before navigating
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setShakeKey((k) => k + 1); // retrigger shake animation
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-inner">

        {/* ── Left Panel ── */}
        <div className="auth-panel">
          <NeuralNetworkCanvas />

          <motion.div
            className="auth-panel-content"
            variants={containerStagger}
            initial="hidden"
            animate="show"
          >
            <motion.div className="auth-panel-brand" variants={fadeUpItem}>
              <div className="auth-panel-mark">V</div>
              <div className="auth-panel-title">VERIDYN</div>
            </motion.div>

            <motion.h2 className="auth-panel-headline" variants={fadeUpItem}>
              Track. Analyze.<br />
              <span>Predict.</span>
            </motion.h2>

            <motion.p className="auth-panel-desc" variants={fadeUpItem}>
              An AI-powered behavioral productivity platform that measures your discipline, detects patterns, and predicts performance drops before they happen.
            </motion.p>

            <div className="auth-features">
              {[
                { icon: '◎', title: 'Discipline Score Engine', desc: 'Daily behavioral scoring with tier classification' },
                { icon: '▦', title: 'Risk Predictor', desc: 'AI-powered forecasting of productivity decline' },
                { icon: '◈', title: 'Study Pattern Analysis', desc: 'Discover your peak and worst performance hours' },
              ].map((f) => (
                <motion.div className="auth-feature" key={f.title} variants={fadeUpItem}>
                  <div className="auth-feature-icon">{f.icon}</div>
                  <div className="auth-feature-text">
                    <strong>{f.title}</strong>
                    <span>{f.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="auth-form-panel">
          <div className="auth-container">
            <motion.div
              className="auth-card"
              key={shakeKey}
              initial={{ opacity: 0, y: 24 }}
              animate={
                shakeKey > 0
                  ? { opacity: 1, y: 0, x: [0, -10, 10, -8, 8, -4, 4, 0] }
                  : { opacity: 1, y: 0 }
              }
              transition={
                shakeKey > 0
                  ? { x: { duration: 0.5, ease: 'easeInOut' } }
                  : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
              }
            >
              <div className="auth-header">
                <div className="auth-ai-badge">
                  <span className="auth-ai-badge-dot">●</span>
                  <span>AI-Powered Platform</span>
                </div>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to your intelligence dashboard</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    className="form-error-message"
                    style={{ marginBottom: '1.5rem' }}
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <span>⚠</span>
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon">@</span>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <span className="form-input-focus-line" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon">◎</span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="form-input"
                      style={{ paddingRight: '2.75rem' }}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((s) => !s)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '🙈' : '👁'}
                    </button>
                    <span className="form-input-focus-line" />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className={`auth-submit-btn${success ? ' is-success' : ''}`}
                  disabled={loading || success}
                  whileHover={!loading && !success ? { y: -1, scale: 1.01 } : {}}
                  whileTap={!loading && !success ? { scale: 0.98 } : {}}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {success ? (
                      <motion.span
                        key="success"
                        className="btn-success-check"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, ease: 'backOut' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <motion.path
                            d="M4 12.5L9.5 18L20 6"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                          />
                        </svg>
                        Signed in
                      </motion.span>
                    ) : loading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <span className="btn-spinner" /> Signing in...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Sign in →
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>

              <div className="auth-footer">
                Don't have an account?{' '}
                <Link to="/signup">Create one free</Link>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}
