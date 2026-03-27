import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import '../styles/auth.css';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    setLoading(true);

    console.log('Sending registration data:', formData);
    try {
  await api.post('/auth/register', formData);
navigate('/login');
    } catch (err) {
  console.log('Full error:', err.response?.data); // ADD THIS LINE
  setError(err.response?.data?.message || 'Registration failed');
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">✨</div>
            <div className="auth-ai-badge"><span>🤖</span><span>AI-Powered Productivity</span></div>
            <h1 className="auth-title">Join Veridyn</h1>
            <p className="auth-subtitle">Start your journey to peak productivity with AI</p>
          </div>

          {error && (
            <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #ef4444', color: '#dc2626' }}>
              ⚠️ {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">👤</span>
                <input type="text" name="name" className="form-input" placeholder="johndoe" value={formData.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">📧</span>
                <input type="email" name="email" className="form-input" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">🔒</span>
                <input type="password" name="password" className="form-input" placeholder="••••••••" value={formData.password} onChange={handleChange} required minLength={6} />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-loading"><span className="auth-spinner"></span>Creating account...</span> : 'Create Account'}
            </button>
          </form>

          <div className="auth-features">
            <div className="auth-feature-list">
              <div className="auth-feature-item"><div className="auth-feature-icon">✓</div><span>AI risk prediction</span></div>
              <div className="auth-feature-item"><div className="auth-feature-icon">✓</div><span>Study patterns</span></div>
              <div className="auth-feature-item"><div className="auth-feature-icon">✓</div><span>Smart prioritization</span></div>
              <div className="auth-feature-item"><div className="auth-feature-icon">✓</div><span>Weekly reports</span></div>
            </div>
          </div>

          <div className="auth-footer">
            <p className="auth-footer-text">Already have an account? <Link to="/login" className="auth-footer-link">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}