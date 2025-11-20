/**
 * Goals Page - Set and track fitness goals
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import './Goals.css';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'weight_loss',
    target: '',
  });

  const goalTypes = [
    { value: 'weight_loss', label: 'Weight Loss', icon: '⚖️', unit: 'kg' },
    { value: 'weight_gain', label: 'Weight Gain', icon: '💪', unit: 'kg' },
    { value: 'muscle_gain', label: 'Muscle Gain', icon: '🏋️', unit: 'kg' },
    { value: 'body_fat', label: 'Body Fat %', icon: '📉', unit: '%' },
    { value: 'workout_days', label: 'Workout Days', icon: '📅', unit: 'days/week' },
    { value: 'steps', label: 'Daily Steps', icon: '👟', unit: 'steps' },
  ];

  useEffect(() => {
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await apiService.getGoals(user.user_id);
      setGoals(data.goals || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiService.setGoal(user.user_id, formData.type, parseFloat(formData.target));
      setShowForm(false);
      setFormData({ type: 'weight_loss', target: '' });
      loadGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getGoalTypeInfo = (type) => {
    return goalTypes.find(t => t.value === type) || goalTypes[0];
  };

  // eslint-disable-next-line no-unused-vars
  const calculateProgress = (goal) => {
    // Mock progress calculation (in real app, compare with current value)
    return Math.min(Math.random() * 100, 100);
  };

  return (
    <div className="goals-page">
      <div className="page-header">
        <div>
          <h1>🎯 Goals</h1>
          <p>Set targets and track your fitness achievements</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '➕ Set New Goal'}
        </button>
      </div>

      {/* Create Goal Form */}
      {showForm && (
        <div className="card goal-form fade-in">
          <h3>Set New Goal</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Goal Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {goalTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Target Value</label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  placeholder={`Enter target (${getGoalTypeInfo(formData.type).unit})`}
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      <div className="goals-grid">
        {loading && <div className="spinner"></div>}
        {!loading && goals.length === 0 && (
          <div className="empty-state card">
            <h3>No goals set yet</h3>
            <p>Set your first fitness goal to start your journey!</p>
          </div>
        )}
        {!loading && goals.map((goal) => {
          const typeInfo = getGoalTypeInfo(goal.type);
          const progress = calculateProgress(goal);
          return (
            <div key={goal.id} className="goal-card card">
              <div className="goal-icon">{typeInfo.icon}</div>
              <div className="goal-content">
                <h3>{typeInfo.label}</h3>
                <p className="goal-target">
                  Target: <strong>{goal.target} {typeInfo.unit}</strong>
                </p>
                
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="progress-text">{progress.toFixed(0)}% Complete</p>
                
                <div className="goal-status">
                  {progress >= 100 ? (
                    <span className="badge badge-success">✓ Achieved!</span>
                  ) : progress >= 50 ? (
                    <span className="badge badge-warning">In Progress</span>
                  ) : (
                    <span className="badge badge-info">Just Started</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;
