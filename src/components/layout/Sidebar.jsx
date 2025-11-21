/**
 * Sidebar Navigation Component - Collapsible sidebar with menu items
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import './Sidebar.css';

const Sidebar = ({ currentPage, onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();

  // Detect mobile and set initial state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Start collapsed on mobile
      if (mobile) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'health', label: 'Health', icon: '❤️' },
    { id: 'fitness', label: 'Fitness', icon: '💪' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'ai-analysis', label: 'AI Analysis', icon: '🤖' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'api-test', label: 'API Test', icon: '🧪' },
  ];

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigation = (id) => {
    onNavigate(id);
    // Auto-close on mobile after navigation
    if (isMobile) {
      setCollapsed(true);
    }
  };

  return (
    <>
      {/* Mobile Overlay - show when sidebar is open on mobile */}
      {isMobile && !collapsed && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Floating Toggle Button for Mobile (when sidebar is hidden) */}
      {isMobile && collapsed && (
        <button 
          className="sidebar-mobile-toggle" 
          onClick={handleToggle}
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">💪</span>
            {!collapsed && <span className="logo-text text-gradient">FitLife AI</span>}
          </div>
          <button 
            className="sidebar-toggle" 
            onClick={handleToggle}
            aria-label="Toggle sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="sidebar-user">
            <div className="user-avatar gradient-primary">
              {(user?.name && typeof user.name === 'string') ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.name || 'User'}</p>
              <p className="user-mobile">{user?.mobile || ''}</p>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleNavigation(item.id)}
              title={collapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="sidebar-footer">
          <div className="theme-toggle-wrapper">
            <ThemeToggle />
            {!collapsed && <span className="footer-label">Theme</span>}
          </div>
          
          <button 
            className="logout-btn" 
            onClick={logout}
            title={collapsed ? 'Logout' : ''}
          >
            <span className="nav-icon">🚪</span>
            {!collapsed && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
