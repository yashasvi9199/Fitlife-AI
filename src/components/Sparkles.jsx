/**
 * Sparkles Component - Floating particle effects
 */

import { useEffect } from 'react';

const Sparkles = ({ count = 20 }) => {
  useEffect(() => {
    const createSparkle = () => {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.animationDuration = `${3 + Math.random() * 4}s`;
      sparkle.style.animationDelay = `${Math.random() * 5}s`;
      document.body.appendChild(sparkle);

      setTimeout(() => {
        sparkle.remove();
      }, 7000);
    };

    const interval = setInterval(() => {
      if (document.querySelectorAll('.sparkle').length < count) {
        createSparkle();
      }
    }, 300);

    return () => {
      clearInterval(interval);
      document.querySelectorAll('.sparkle').forEach(s => s.remove());
    };
  }, [count]);

  return null;
};

export default Sparkles;
