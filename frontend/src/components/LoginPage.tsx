import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Lock, Mail, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('analyst@loopr.ai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch {
      // Handled in AuthContext via AlertChips
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('analyst@loopr.ai');
    setPassword('password123');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand">
          <div className="brand-icon-wrapper">
            <TrendingUp size={28} className="brand-logo-icon" />
          </div>
          <h1 className="brand-name">ApexFin Analytics</h1>
          <p className="brand-tagline">Corporate Financial Intelligence & Analytics Platform</p>
        </div>

        {/* Demo Account Helper Card */}
        <div className="demo-credentials-banner" onClick={fillDemoCredentials} role="button" tabIndex={0}>
          <div className="demo-badge">
            <Sparkles size={14} />
            <span>Demo Account Ready</span>
          </div>
          <div className="demo-info">
            <p className="demo-email">
              <strong>User:</strong> analyst@loopr.ai
            </p>
            <p className="demo-pass">
              <strong>Pass:</strong> password123
            </p>
          </div>
          <span className="demo-click-hint">Click to auto-fill</span>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Work Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@loopr.ai"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={submitting || loading}
          >
            {submitting ? (
              <span className="btn-spinner-text">Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Security Footer */}
        <div className="login-footer">
          <ShieldCheck size={14} className="security-icon" />
          <span>Secured with JWT Token Authentication & Encrypted API Endpoints</span>
        </div>
      </div>
    </div>
  );
};
