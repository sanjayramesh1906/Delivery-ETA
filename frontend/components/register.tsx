/// <reference types="react" />
import React, { useState } from 'react';
import './register.css';

interface RegisterProps {
  onRegisterSuccess: (name: string, email: string) => void;
  onBackToHome?: () => void;
  onBackToLogin?: () => void;
}

export const RegisterPage: React.FC<RegisterProps> = ({
  onRegisterSuccess,
  onBackToHome,
  onBackToLogin,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>('Manager');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  // Validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    agreeTerms?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
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

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate registration API processing delay
    setTimeout(() => {
      setIsSubmitting(false);
      onRegisterSuccess(name, email);
    }, 1200);
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
            <img 
              src="/logo.png" 
              alt="Delhivery Logo" 
              className="traveloop-auth-logo" 
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
                (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/airport.png';
              }} 
            />
          </div>
          <h2 className="traveloop-auth-title">Create Account</h2>
          <p className="traveloop-auth-subtitle">
            Register to join the logistics operator & route intelligence network
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="traveloop-auth-form" noValidate>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {errors.name && <span className="traveloop-form-error">{errors.name}</span>}
          </div>

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
                placeholder="name@company.com"
                className={`traveloop-auth-input ${errors.email ? 'error' : ''}`}
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <span className="traveloop-form-error">{errors.email}</span>}
          </div>

          <div className="traveloop-form-group">
            <label htmlFor="password-input" className="traveloop-form-label">Password</label>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="traveloop-password-toggle"
                onClick={(): void => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
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

          <div className="traveloop-form-group">
            <label htmlFor="role-select" className="traveloop-form-label">Operator Role</label>
            <div className="traveloop-input-wrapper">
              <svg className="traveloop-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <select
                id="role-select"
                className="traveloop-auth-select"
                value={role}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="Manager">Logistics Manager</option>
                <option value="Controller">Fleet Controller</option>
                <option value="Coordinator">Route Coordinator</option>
              </select>
              <div className="traveloop-select-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="traveloop-checkbox-group">
            <input
              id="terms-checkbox"
              type="checkbox"
              className={`traveloop-checkbox-input ${errors.agreeTerms ? 'error' : ''}`}
              checked={agreeTerms}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreeTerms(e.target.checked)}
              disabled={isSubmitting}
            />
            <label htmlFor="terms-checkbox" className="traveloop-checkbox-label">
              I agree to the <a href="#terms">Terms of Service</a> & <a href="#privacy">Privacy Policy</a>
            </label>
          </div>
          {errors.agreeTerms && <span className="traveloop-form-error" style={{ display: 'block', textAlign: 'left' }}>{errors.agreeTerms}</span>}

          <button
            type="submit"
            className="traveloop-auth-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="traveloop-btn-spinner"></span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Auth Toggle Footer */}
        <div className="traveloop-auth-footer">
          <span>Already have an account? </span>
          <button
            type="button"
            className="traveloop-toggle-auth-mode"
            onClick={onBackToLogin}
            disabled={isSubmitting}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
