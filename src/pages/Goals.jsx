/**
 * Goals Page - Set and track fitness goals
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';
import './Goals.css';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [editingGoal, setEditingGoal] = useState(null);
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

  // Motivational quotes for different goal states
  const motivationalQuotes = {
    inProgress: [
      "Every step forward is progress, no matter how small!",
      "You're stronger than you think. Keep pushing!",
      "Consistency is the key to success. You've got this!",
      "The only bad workout is the one you didn't do.",
      "Your future self will thank you for not giving up!",
      "Progress, not perfection. Keep going!",
      "Believe in yourself and all that you are!",
      "Small daily improvements lead to stunning results!",
      "You didn't come this far to only come this far!",
      "Champions keep playing until they get it right!"
    ],
    completed: [
      "🎉 Amazing! You crushed this goal!",
      "🏆 Incredible achievement! You're unstoppable!",
      "⭐ Outstanding! Time to set a new challenge!",
      "💪 You did it! Your dedication paid off!",
      "🌟 Phenomenal work! You're an inspiration!",
      "🎯 Goal conquered! What's next, champion?",
      "✨ Brilliant! You've proven what you're capable of!",
      "🔥 On fire! This is just the beginning!",
      "💯 Perfect! Your hard work speaks volumes!",
      "🚀 Mission accomplished! Ready for the next level?"
    ],
    justStarted: [
      "Great start! The journey of a thousand miles begins with one step.",
      "You've begun! That's the hardest part. Keep it up!",
      "Starting is half the battle. You're already winning!",
      "Every expert was once a beginner. You're on your way!",
      "The first step is always the hardest. You've taken it!",
      "New beginnings are exciting! Embrace the journey!",
      "You've planted the seed. Now watch it grow!",
      "Starting strong! Momentum is building!",
      "The best time to start was yesterday. The next best time is now!",
      "You're writing your success story, one day at a time!"
    ]
  };

  useEffect(() => {
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      
      // Fetch from API
      const data = await apiService.getGoals(user.user_id);
      const goalsList = Array.isArray(data) ? data : [];
      setGoals(goalsList);
      
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      type: goal.type,
      target: goal.target
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      setLoading(true);
      console.log('Deleting goal:', id);
      await apiService.deleteGoal(id);
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingGoal) {
        await apiService.updateGoal(editingGoal.id, parseFloat(formData.target));
      } else {
        await apiService.setGoal(user.user_id, formData.type, parseFloat(formData.target));
      }
      
      setShowForm(false);
      setEditingGoal(null);
      setFormData({ type: 'weight_loss', target: '' });
      loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal. Please try again.');
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

  const getMotivationalQuote = (progress) => {
    let quotes;
    if (progress >= 100) {
      quotes = motivationalQuotes.completed;
    } else if (progress >= 50) {
      quotes = motivationalQuotes.inProgress;
    } else {
      quotes = motivationalQuotes.justStarted;
    }
    // Use a consistent random quote based on progress (so it doesn't change on re-render)
    const index = Math.floor(progress) % quotes.length;
    return quotes[index];
  };

  return (
    <div className="goals-page">
      <div className="page-header">
        <div>
          <h1>🎯 Goals</h1>
          <p>Set targets and track your fitness achievements</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setShowForm(!showForm);
          setEditingGoal(null);
          setFormData({ type: 'weight_loss', target: '' });
        }}>
          {showForm ? '✕ Cancel' : '➕ Set New Goal'}
        </button>
      </div>

      {/* Create/Edit Goal Form */}
      {showForm && (
        <div className="card goal-form fade-in">
          <h3>{editingGoal ? 'Edit Goal' : 'Set New Goal'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Goal Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  disabled={!!editingGoal}
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
              {loading ? 'Saving...' : (editingGoal ? 'Update Goal' : 'Create Goal')}
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
          const quote = getMotivationalQuote(progress);
          
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

                {/* Motivational Quote */}
                <div className="goal-motivation">
                  <span className="motivation-icon">💭</span>
                  <p className="motivation-text">{quote}</p>
                </div>
              </div>
              <div className="goal-actions">
                <button 
                  className="btn-icon" 
                  onClick={() => handleEdit(goal)}
                  title="Edit Goal"
                >
                  ✏️
                </button>
                <button 
                  className="btn-icon" 
                  onClick={() => onDeleteGoal(goal.id)}
                  title="Delete Goal"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;
