/**
 * Main App Component - FitLife AI
 * Entry point with routing, authentication, and layout
 */

import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Sidebar from './components/layout/Sidebar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Health from './pages/Health';
import Fitness from './pages/Fitness';
import Goals from './pages/Goals';
import Calendar from './pages/Calendar';
import AIAnalysis from './pages/AIAnalysis';
import Profile from './pages/Profile';
import APITest from './pages/APITest';
import './App.css';

// Main App Content (after authentication)
const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger shortcuts when typing in input/textarea/select
      const activeElement = document.activeElement;
      if (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable
      ) {
        return;
      }

      // Alt/Option + number keys for quick navigation
      if (e.altKey && !user) return;
      
      const shortcuts = {
        '1': 'dashboard',
        '2': 'health',
        '3': 'fitness',
        '4': 'goals',
        '5': 'calendar',
        '6': 'ai-analysis',
        '7': 'profile',
        '8': 'api-test',
      };

      if (shortcuts[e.key]) {
        e.preventDefault();
        setCurrentPage(shortcuts[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [user]);

  if (loading) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading FitLife AI...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'health':
        return <Health />;
      case 'fitness':
        return <Fitness />;
      case 'goals':
        return <Goals />;
      case 'calendar':
        return <Calendar />;
      case 'ai-analysis':
        return <AIAnalysis />;
      case 'profile':
        return <Profile />;
      case 'api-test':
        return <APITest />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="app-main" role="main">
        {renderPage()}
      </main>
    </div>
  );
};

// Root App Component
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
