import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import '../styles/auth.css';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-inner">

        {/* ── Left Panel ── */}
        <div className="auth-panel">
          <div className="auth-panel-brand">
            <div className="auth-panel-mark">V</div>
            <div className="auth-panel-title">VERIDYN</div>
          </div>

          <h2 className="auth-panel-headline">
            Track. Analyze.<br />
            <span>Predict.</span>
          </h2>
          <p className="auth-panel-desc">
            An AI-powered behavioral productivity platform that measures your discipline, detects patterns, and predicts performance drops before they happen.
          </p>

          <div className="auth-features">
            {[
              { icon: '◎', title: 'Discipline Score Engine', desc: 'Daily behavioral scoring with tier classification' },
              { icon: '▦', title: 'Risk Predictor', desc: 'AI-powered forecasting of productivity decline' },
              { icon: '◈', title: 'Study Pattern Analysis', desc: 'Discover your peak and worst performance hours' },
            ].map((f) => (
              <div className="auth-feature" key={f.title}>
                <div className="auth-feature-icon">{f.icon}</div>
                <div className="auth-feature-text">
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="auth-form-panel">
          <div className="auth-container">
            <div className="auth-card">
              <div className="auth-header">
                <div className="auth-ai-badge">
                  <span>●</span>
                  <span>AI-Powered Platform</span>
                </div>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to your intelligence dashboard</p>
              </div>

              {error && (
                <div className="form-error-message" style={{ marginBottom: '1.5rem' }}>
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}

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
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon">◎</span>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <><span className="btn-spinner" /> Signing in...</>
                  ) : (
                    'Sign in →'
                  )}
                </button>
              </form>

              <div className="auth-footer">
                Don't have an account?{' '}
                <Link to="/signup">Create one free</Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
