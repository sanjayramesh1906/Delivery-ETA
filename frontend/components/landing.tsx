import React from 'react';
import './landing.css';

// SVG Icons for Feature Cards
const MapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CompassIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

interface LandingPageProps {
  onSignInClick: () => void;
  onRegisterClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignInClick, onRegisterClick }) => {
  const features = [
    {
      icon: <MapIcon />,
      title: 'Network Graph Visibility',
      desc: 'Visualize dynamic topological mappings of hub-to-hub connections, linehaul corridors, and logistics dispatch routes.',
    },
    {
      icon: <ActivityIcon />,
      title: 'Bottleneck Analysis',
      desc: 'Detect queue buildup, lane congestion, and hub delays before they impact service-level agreements (SLAs).',
    },
    {
      icon: <ClockIcon />,
      title: 'ETA Prediction Engine',
      desc: 'Utilize machine-learning models backed by historical transit times, weather factors, and live GPS coordination.',
    },
    {
      icon: <CompassIcon />,
      title: 'Corridor Intelligence',
      desc: 'Compare delivery efficiencies between FTL (Full Truckload) and Carting models to optimize operational margins.',
    },
  ];

  return (
    <div className="traveloop-landing-container">
      {/* Landing Header */}
      <header className="traveloop-landing-header">
        <div className="traveloop-landing-logo-section">
          <img src="/logo.png" alt="Delhivery Logo" className="traveloop-landing-logo" onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/airport.png';
          }} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            className="traveloop-landing-signin-btn" 
            onClick={onSignInClick}
            style={{ backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-color)' }}
          >
            Sign In
          </button>
          <button type="button" className="traveloop-landing-signin-btn" onClick={onRegisterClick}>
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="traveloop-landing-hero">
        <div className="traveloop-hero-content">
          <div className="traveloop-hero-badge">Logistic Intelligence Hub</div>
          <h1 className="traveloop-hero-title">
            Next-Gen Route Intelligence & Real-Time ETA Prediction
          </h1>
          <p className="traveloop-hero-desc">
            Empower your dispatch operations with dynamic corridor mapping, predictive bottleneck analysis, and machine-learning transit scores engineered for high-velocity supply chain networks.
          </p>
          <div className="traveloop-hero-actions">
            <button type="button" className="traveloop-hero-btn primary" onClick={onRegisterClick}>
              Register Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" x2="19" y1="12" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button type="button" className="traveloop-hero-btn secondary" onClick={onSignInClick}>
              Sign In to Dashboard
            </button>
          </div>
        </div>

        {/* Floating Abstract Dashboard Graphics */}
        <div className="traveloop-hero-graphics">
          <div className="traveloop-graphic-card main">
            <div className="traveloop-card-header">
              <span className="traveloop-dot red"></span>
              <span className="traveloop-dot yellow"></span>
              <span className="traveloop-dot green"></span>
              <span className="traveloop-card-title">Live Dispatch Performance</span>
            </div>
            <div className="traveloop-card-body">
              <div className="traveloop-graphic-line">
                <span className="label">ETA Accuracy</span>
                <div className="bar-wrapper">
                  <div className="bar active" style={{ width: '94.2%' }}></div>
                </div>
                <span className="value text-success">94.2%</span>
              </div>
              <div className="traveloop-graphic-line">
                <span className="label">Active Hubs</span>
                <div className="bar-wrapper">
                  <div className="bar active blue" style={{ width: '78%' }}></div>
                </div>
                <span className="value text-blue">142 Active</span>
              </div>
              <div className="traveloop-graphic-line">
                <span className="label">Avg Queue Delay</span>
                <div className="bar-wrapper">
                  <div className="bar active orange" style={{ width: '22%' }}></div>
                </div>
                <span className="value text-orange">14 Mins</span>
              </div>
            </div>
          </div>
          <div className="traveloop-graphic-card overlay">
            <div className="traveloop-stat-title">System Health</div>
            <div className="traveloop-stat-value">Normal</div>
            <div className="traveloop-stat-sub">SLA Breach Risk Low</div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="traveloop-landing-features">
        <h2 className="traveloop-section-title">Core Operations Control</h2>
        <p className="traveloop-section-desc">
          Unified control plane designed to streamline transport decisions, prevent delay amplification, and optimize transit visibility.
        </p>
        <div className="traveloop-features-grid">
          {features.map((feature, i) => (
            <div key={i} className="traveloop-feature-card">
              <div className="traveloop-feature-icon">{feature.icon}</div>
              <h3 className="traveloop-feature-title">{feature.title}</h3>
              <p className="traveloop-feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="traveloop-landing-footer">
        <div className="traveloop-footer-logo-line">
          <img src="/logo.png" alt="Delhivery Logo" className="traveloop-footer-logo" onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/airport.png';
          }} />
        </div>
        <p className="traveloop-footer-copyright">
          © {new Date().getFullYear()} Delhivery ETA. All rights reserved. Operator Control Panel v1.2.0
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
