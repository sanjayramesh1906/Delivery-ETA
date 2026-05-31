import React, { useState } from 'react';
import './login.css';

interface LoginProps {
  onLoginSuccess: (name: string, email: string) => void;
  onBackToHome?: () => void;
  onRegisterClick?: () => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onLoginSuccess, onBackToHome, onRegisterClick }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Validation and UI states
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (isSignup && !name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API request delay
    setTimeout(() => {
      setIsSubmitting(false);
      const finalName = isSignup ? name : 'Operator Admin';
      onLoginSuccess(finalName, email);
    }, 1000);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setForgotPasswordOpen(false);
      setForgotEmail('');
      alert(`Password reset instructions sent to ${forgotEmail}`);
    }, 1500);
  };

  return (
    <div className="traveloop-auth-container">
      <div className="traveloop-auth-card">
        {onBackToHome && (
          <button
            type="button"
            className="traveloop-back-home-btn"
            onClick={onBackToHome}
            aria-label="Back to home page"
          >
            ← Back to Home
          </button>
        )}
        {/* Brand Header */}
        <div className="traveloop-auth-header">
          <div className="traveloop-auth-logo-box">
            <img src="/logo.png" alt="Delhivery Logo" className="traveloop-auth-logo" onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/airport.png';
            }} />
          </div>
          <h2 className="traveloop-auth-title">
            {isSignup ? 'Create Account' : 'Sign In to Delivery-ETA'}
          </h2>
          <p className="traveloop-auth-subtitle">
            {isSignup 
              ? 'Join the logistics optimization platform' 
              : 'Enter your credentials to access the operator dashboard'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="traveloop-auth-form" noValidate>
          {isSignup && (
            <div className="traveloop-form-group">
              <label htmlFor="name-input" className="traveloop-form-label">Full Name</label>
              <div className="traveloop-input-wrapper">
                <svg className="traveloop-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="name-input"
                  type="text"
                  placeholder="e.g. John Doe"
                  className={`traveloop-auth-input ${errors.name ? 'error' : ''}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              {errors.name && <span className="traveloop-form-error">{errors.name}</span>}
            </div>
          )}

          <div className="traveloop-form-group">
            <label htmlFor="email-input" className="traveloop-form-label">Email Address</label>
            <div className="traveloop-input-wrapper">
              <svg className="traveloop-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
              </svg>
              <input
                id="email-input"
                type="email"
                placeholder="operator@delhivery-eta.in"
                className={`traveloop-auth-input ${errors.email ? 'error' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <span className="traveloop-form-error">{errors.email}</span>}
          </div>

          <div className="traveloop-form-group">
            <div className="traveloop-label-row">
              <label htmlFor="password-input" className="traveloop-form-label">Password</label>
              {!isSignup && (
                <button
                  type="button"
                  className="traveloop-forgot-link"
                  onClick={() => setForgotPasswordOpen(true)}
                  disabled={isSubmitting}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="traveloop-input-wrapper">
              <svg className="traveloop-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`traveloop-auth-input ${errors.password ? 'error' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="traveloop-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="traveloop-form-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="traveloop-auth-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="traveloop-btn-spinner"></span>
            ) : isSignup ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Auth Toggle Footer */}
        <div className="traveloop-auth-footer">
          <span>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          </span>
          <button
            type="button"
            className="traveloop-toggle-auth-mode"
            onClick={() => {
              if (onRegisterClick) {
                onRegisterClick();
              } else {
                setIsSignup(!isSignup);
                setErrors({});
              }
            }}
            disabled={isSubmitting}
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="traveloop-modal-overlay">
          <div className="traveloop-modal-card">
            <h3 className="traveloop-modal-title">Reset Password</h3>
            <p className="traveloop-modal-desc">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            <form onSubmit={handleForgotPasswordSubmit} className="traveloop-modal-form">
              <div className="traveloop-form-group">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="traveloop-auth-input"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={forgotSent}
                />
              </div>
              <div className="traveloop-modal-actions">
                <button
                  type="button"
                  className="traveloop-modal-cancel"
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setForgotEmail('');
                  }}
                  disabled={forgotSent}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="traveloop-modal-submit"
                  disabled={forgotSent}
                >
                  {forgotSent ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
