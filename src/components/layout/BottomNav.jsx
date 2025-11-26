import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'history', label: 'History', icon: '🕒', path: '/' },
    { id: 'health', label: 'Health', icon: '❤️', path: '/health' },
    { id: 'fitness', label: 'Fitness', icon: '🧭', path: '/fitness' },
    { id: 'goals', label: 'Goals', icon: '🎯', path: '/goals' },
    { id: 'calendar', label: 'Calendar', icon: '📅', path: '/calendar' },
    { id: 'ai-analysis', label: 'AI', icon: '🤖', path: '/ai-analysis' },
    { id: 'profile', label: 'Profile', icon: '👤', path: '/profile' },
    { id: 'theme', label: theme === 'dark' ? 'Light' : 'Dark', icon: theme === 'dark' ? '🌙' : '☀️', action: 'theme' },
    { id: 'logout', label: 'Logout', icon: '🚪', action: 'logout' },
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

  const handleItemClick = (item) => {
    if (item.action === 'logout') {
      if (window.confirm('Are you sure you want to logout?')) {
        logout();
      }
      return;
    }

    if (item.action === 'theme') {
      toggleTheme();
      return;
    }

    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const isActive = activeId === item.id && !item.action;
        return (
        <button
          key={item.id}
          className={`bottom-nav-item ${isActive ? 'active' : ''} ${item.action ? 'utility' : ''}`}
          onClick={() => handleItemClick(item)}
        >
          <div className={`icon-container ${isActive ? 'active-pill' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
          </div>
          <span className="nav-label">{item.label}</span>
        </button>
      );
      })}
    </div>
  );
};

export default BottomNav;
