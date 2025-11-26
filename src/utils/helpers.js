/**
 * Utility functions for input sanitization and validation
 */

/**
 * Sanitize string input to prevent XSS attacks
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>"'`]/g, '') // Remove HTML tags and quotes
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize HTML to remove dangerous tags and attributes
 */
export const sanitizeHTML = (html) => {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

/**
 * Sanitize SQL input to prevent injection
 */
export const sanitizeSQL = (input) => {
  return input.replace(/['";\\]/g, ''); // Remove SQL injection characters
};

/**
 * Sanitize numbers to prevent unexpected values
 */
export const sanitizeNumber = (input) => {
  return input.replace(/[^0-9.-]/g, ''); // Keep only numbers, dots, and hyphens
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-+()]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate number within range
 */
export const isValidNumber = (value, min = -Infinity, max = Infinity) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Debounce function for search inputs
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for scroll/resize events
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Format date to readable string
 */
export const formatDate = (date, options = {}) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(date);
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate a proper UUID v4 (compatible with PostgreSQL UUID type)
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if device is mobile
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Check if device supports touch
 */
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Local storage with error handling
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};
