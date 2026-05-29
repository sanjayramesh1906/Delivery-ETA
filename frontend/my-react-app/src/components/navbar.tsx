/// <reference types="react" />
import React, { useState, useEffect, useRef } from 'react';
import './navbar.css';

// SVG Icons for Delivery-ETA Dashboard typed strictly as React.FC components
const NetworkIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="8.12" y1="8.12" x2="9.88" y2="9.88" />
    <line x1="14.12" y1="9.88" x2="15.88" y2="8.12" />
    <line x1="15.88" y1="15.88" x2="14.12" y2="14.12" />
    <line x1="9.88" y1="14.12" x2="8.12" y2="15.88" />
  </svg>
);

const BottleneckIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6V4H6v2c0 2.2 1.8 4 4 4v2c-2.2 0-4 1.8-4 4v2h12v-2c0-2.2-1.8-4-4-4v-2c2.2 0 4-1.8 4-4Z" />
    <line x1="6" x2="18" y1="2" y2="2" />
    <line x1="6" x2="18" y1="22" y2="22" />
  </svg>
);

const EtaIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CorridorIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 22V2h-4v20h4Z" />
    <path d="M10 22V2H6v20h4Z" />
    <line x1="12" x2="12" y1="5" y2="7" strokeDasharray="3 3" />
    <line x1="12" x2="12" y1="11" y2="13" strokeDasharray="3 3" />
    <line x1="12" x2="12" y1="17" y2="19" strokeDasharray="3 3" />
  </svg>
);

const ComparisonIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="16" x="2" y="4" rx="2" />
    <rect width="8" height="16" x="14" y="4" rx="2" />
    <line x1="10" x2="14" y1="12" y2="12" />
  </svg>
);

const HubIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const AlertIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ReportIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
  </svg>
);

const AdminIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="11" r="3" />
  </svg>
);

const UserIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogOutIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const MenuIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
);

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onNewTripClick?: () => void;
  onSimulationRun?: () => void;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  logoUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'network-graph',
  onTabChange,
  onNewTripClick,
  onSimulationRun,
  userName = 'Operator Admin',
  userEmail = 'operator@delhivery-eta.in',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
  logoUrl = '/logo.png',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const navigationItems: NavItem[] = [
    { id: 'network-graph', label: 'Network Graph', icon: <NetworkIcon /> },
    { id: 'bottleneck', label: 'Bottleneck Analysis', icon: <BottleneckIcon /> },
    { id: 'eta', label: 'ETA Prediction', icon: <EtaIcon /> },
    { id: 'corridor', label: 'Corridor Intelligence', icon: <CorridorIcon /> },
    { id: 'ftl-vs-carting', label: 'FTL vs Carting', icon: <ComparisonIcon /> },
    { id: 'hub', label: 'Hub Details', icon: <HubIcon /> },
    { id: 'alerts', label: 'Alerts', icon: <AlertIcon /> },
    { id: 'reports', label: 'Reports', icon: <ReportIcon /> },
    { id: 'admin', label: 'Admin', icon: <AdminIcon /> },
  ];

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTabClick = (tabId: string): void => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    setIsMobileMenuOpen(false);
  };

  const handleProfileItemClick = (actionId: string): void => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    if (onTabChange) {
      onTabChange(actionId);
    }
  };

  return (
    <nav className="traveloop-nav-container">
      <div className="traveloop-nav-content">
        {/* Logo Section */}
        <a
          href="#network-graph"
          className="traveloop-logo-section"
          onClick={(e: React.MouseEvent<HTMLAnchorElement>): void => {
            e.preventDefault();
            handleTabClick('network-graph');
          }}
        >
          <img
            src={logoUrl}
            alt="Delhivery Logo"
            className="traveloop-logo-img"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
              (e.target as HTMLImageElement).src =
                'https://img.icons8.com/color/96/airport.png';
            }}
          />
        </a>

        {/* Desktop Navigation Links */}
        <div className="traveloop-nav-links">
          {navigationItems.map((item: NavItem) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`traveloop-nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>): void => {
                e.preventDefault();
                handleTabClick(item.id);
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* User Avatar */}
        <div className="traveloop-actions-section">
          <div className="traveloop-profile-wrapper" ref={profileDropdownRef}>
            <button
              type="button"
              className="traveloop-profile-btn"
              onClick={(): void => setIsProfileOpen(!isProfileOpen)}
              aria-label="Toggle profile menu"
            >
              <img src={avatarUrl} alt={userName} className="traveloop-avatar" />
              <span className="traveloop-online-dot"></span>
            </button>

            {isProfileOpen && (
              <div className="traveloop-profile-dropdown">
                <div className="traveloop-dropdown-header">
                  <div className="traveloop-dropdown-name">{userName}</div>
                  <div className="traveloop-dropdown-email">{userEmail}</div>
                </div>
                <button
                  type="button"
                  className="traveloop-dropdown-item"
                  onClick={(): void => handleProfileItemClick('admin')}
                >
                  <UserIcon />
                  System Admin Settings
                </button>
                <button
                  type="button"
                  className="traveloop-dropdown-item logout"
                  onClick={(): void => handleProfileItemClick('logout')}
                >
                  <LogOutIcon />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="traveloop-hamburger"
          onClick={(): void => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Slide-down Menu Drawer */}
      <div className={`traveloop-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        {navigationItems.map((item: NavItem) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`traveloop-mobile-nav-link ${activeTab === item.id ? 'active' : ''}`}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>): void => {
              e.preventDefault();
              handleTabClick(item.id);
            }}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
        <div className="traveloop-mobile-actions">
          <div className="traveloop-mobile-profile">
            <img src={avatarUrl} alt={userName} className="traveloop-mobile-avatar" />
            <div className="traveloop-mobile-userinfo">
              <span className="traveloop-mobile-name">{userName}</span>
              <span className="traveloop-mobile-email">{userEmail}</span>
            </div>
          </div>

          <a
            href="#admin"
            className="traveloop-mobile-nav-link"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>): void => {
              e.preventDefault();
              handleProfileItemClick('admin');
            }}
          >
            <UserIcon />
            System Admin Settings
          </a>
          <a
            href="#logout"
            className="traveloop-mobile-nav-link"
            style={{ color: '#F87171' }}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>): void => {
              e.preventDefault();
              handleProfileItemClick('logout');
            }}
          >
            <LogOutIcon />
            Logout
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
