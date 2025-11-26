import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { id: 'history', label: 'History', icon: '🕒', path: '/' },
    { id: 'health', label: 'Health', icon: '❤️', path: '/health' },
    { id: 'fitness', label: 'Fitness', icon: '🧭', path: '/fitness' },
    { id: 'goals', label: 'Goals', icon: '💾', path: '/goals' },
    { id: 'calendar', label: 'Calendar', icon: '📅', path: '/calendar' },
    { id: 'ai-analysis', label: 'Ai-Analysis', icon: '💡', path: '/ai-analysis' },
    { id: 'profile', label: 'Profile', icon: '👤', path: '/profile' },
    { id: 'logout', label: 'Logout', icon: '🚪', path: null, action: 'logout' },
  ];

  // Map current path to active item
  const getActiveId = () => {
    const path = location.pathname;
    if (path === '/') return 'history';
    if (path === '/health') return 'health';
    if (path === '/fitness') return 'fitness';
    if (path === '/goals') return 'goals';
    if (path === '/calendar') return 'calendar';
    if (path === '/ai-analysis') return 'ai-analysis';
    if (path === '/profile') return 'profile';
    return '';
  };

  const activeId = getActiveId();

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav-item ${activeId === item.id ? 'active' : ''}`}
          onClick={() => {
            if (item.action === 'logout') {
              if (window.confirm('Are you sure you want to logout?')) {
                logout();
              }
            } else {
              navigate(item.path);
            }
          }}
        >
          <div className={`icon-container ${activeId === item.id ? 'active-pill' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
          </div>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
