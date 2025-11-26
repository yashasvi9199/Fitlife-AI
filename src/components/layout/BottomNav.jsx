import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(7);

  const navItems = [
    { id: 'history', label: 'Dashboard', icon: '🕒', path: '/' },
    { id: 'health', label: 'Health', icon: '❤️', path: '/health' },
    { id: 'fitness', label: 'Fitness', icon: '🧭', path: '/fitness' },
    { id: 'goals', label: 'Goals', icon: '💾', path: '/goals' },
    { id: 'calendar', label: 'Calendar', icon: '📅', path: '/calendar' },
    { id: 'ai-analysis', label: 'AI', icon: '💡', path: '/ai-analysis' },
    { id: 'profile', label: 'Profile', icon: '👤', path: '/profile' },
  ];

  // Calculate how many items can fit based on screen width
  useEffect(() => {
    const calculateVisibleItems = () => {
      const width = window.innerWidth;
      // Each item needs ~80px, reserve ~60px for expand button
      const availableWidth = width - 64;
      const itemWidth = 80;
      const maxItems = Math.floor(availableWidth / itemWidth);
      // Show at least 3, at most all items minus 1 (to show expand button)
      const count = Math.max(3, Math.min(maxItems, navItems.length - 1));
      setVisibleCount(count);
    };

    calculateVisibleItems();
    window.addEventListener('resize', calculateVisibleItems);
    return () => window.removeEventListener('resize', calculateVisibleItems);
  }, [navItems.length]);

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
  const needsExpansion = navItems.length > visibleCount;
  const displayedItems = isExpanded ? navItems : navItems.slice(0, visibleCount);

  const handleItemClick = (path) => {
    navigate(path);
    setIsExpanded(false);
  };

  return (
    <div className={`bottom-nav ${isExpanded ? 'expanded' : ''}`}>
      <div className="bottom-nav-items">
        {displayedItems.map((item) => (
          <button
            key={item.id}
            className={`bottom-nav-item ${activeId === item.id ? 'active' : ''}`}
            onClick={() => handleItemClick(item.path)}
          >
            <div className={`icon-container ${activeId === item.id ? 'active-pill' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}

        {needsExpansion && (
          <button
            className="expand-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse navigation' : 'Expand navigation'}
          >
            <span className={`expand-arrow ${isExpanded ? 'rotated' : ''}`}>
              ↑
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BottomNav;
