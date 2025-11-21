/**
 * Main App Component - FitLife AI
 * Entry point with routing, authentication, and layout
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading FitLife AI...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return children;
};

// Main Layout Component
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

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
        '1': '/',
        '2': '/health',
        '3': '/fitness',
        '4': '/goals',
        '5': '/calendar',
        '6': '/ai-analysis',
        '7': '/profile',
        '8': '/api-test',
      };

      if (shortcuts[e.key]) {
        e.preventDefault();
        navigate(shortcuts[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [user, navigate]);

  // Determine current page from path
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    return path.substring(1); // remove leading slash
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage={getCurrentPage()} onNavigate={(page) => navigate(page === 'dashboard' ? '/' : `/${page}`)} />
      <main className="app-main" role="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/health" element={<Health />} />
          <Route path="/fitness" element={<Fitness />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/ai-analysis" element={<AIAnalysis />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/api-test" element={<APITest />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

// Root App Component
function App() {
  // Use /FitLifeAI basename only in production (GitHub Pages)
  const basename = import.meta.env.MODE === 'production' ? '/Fitlife-AI' : '/';
  
  return (
    <Router basename={basename}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/*" 
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
