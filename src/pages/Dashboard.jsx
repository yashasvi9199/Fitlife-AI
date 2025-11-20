/**
 * Dashboard Page - Main overview page
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch health stats
      const healthStats = await apiService.getHealthStats(user.user_id, '7days');
      setStats(healthStats);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name || 'Fitnesser'}! 👋</h1>
          <p className="dashboard-subtitle">
            Ready to crush your fitness goals today?
          </p>
        </div>
        <div className="current-date">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card gradient-primary">
          <div className="stat-icon">❤️</div>
          <div className="stat-content">
            <h3>Health Records</h3>
            <p className="stat-value">{stats?.total_records || 0}</p>
            <p className="stat-label">Total tracked</p>
          </div>
        </div>

        <div className="stat-card gradient-accent">
          <div className="stat-icon">💪</div>
          <div className="stat-content">
            <h3>Workouts</h3>
            <p className="stat-value">0</p>
            <p className="stat-label">This week</p>
          </div>
        </div>

        <div className="stat-card gradient-energy">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Goals</h3>
            <p className="stat-value">0</p>
            <p className="stat-label">In progress</p>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)' }}>
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Streak</h3>
            <p className="stat-value">0</p>
            <p className="stat-label">Days active</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="action-card">
            <span className="action-icon">📝</span>
            <span className="action-title">Log Weight</span>
            <span className="action-subtitle">Track your progress</span>
          </button>

          <button className="action-card">
            <span className="action-icon">💪</span>
            <span className="action-title">Start Workout</span>
            <span className="action-subtitle">Begin your routine</span>
          </button>

          <button className="action-card">
            <span className="action-icon">🍎</span>
            <span className="action-title">Scan Food</span>
            <span className="action-subtitle">AI nutrition analysis</span>
          </button>

          <button className="action-card">
            <span className="action-icon">📅</span>
            <span className="action-title">Schedule</span>
            <span className="action-subtitle">Plan your day</span>
          </button>
        </div>
      </div>

      {/* Motivation Quote */}
      <div className="motivation-card">
        <div className="motivation-icon">✨</div>
        <div className="motivation-content">
          <h3>Daily Motivation</h3>
          <p className="motivation-quote">
            "The only bad workout is the one that didn't happen."
          </p>
          <p className="motivation-author">- Unknown</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
