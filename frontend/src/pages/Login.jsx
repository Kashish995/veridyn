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
    setError(''); // Clear error on input
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
  console.log('Login error:', err.response?.data); // ADD THIS
  setError(err.response?.data?.message || 'Login failed. Please try again.');
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">✨</div>
            <div className="auth-ai-badge">
              <span>🤖</span>
              <span>AI-Powered Productivity</span>
            </div>
            <h1 className="auth-title">Welcome to Veridyn</h1>
            <p className="auth-subtitle">
              Sign in to unlock intelligent productivity insights
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="form-error-message" style={{ 
              padding: '1rem', 
              background: 'var(--danger-bg)', 
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem',
              border: '1px solid var(--danger)'
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">📧</span>
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
                <span className="form-input-icon">🔒</span>
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

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-loading">
                  <span className="auth-spinner"></span>
                  Signing in...
                </span>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Features */}
          <div className="auth-features">
            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">✓</div>
                <span>AI-powered productivity insights</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon">✓</div>
                <span>Intelligent risk prediction</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon">✓</div>
                <span>Personalized recommendations</span>
              </div>
            </div>
          </div>

          {/* ADD THIS FOOTER IF MISSING */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?{' '}
              <Link to="/signup" className="auth-footer-link">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}