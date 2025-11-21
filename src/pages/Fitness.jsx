/**
 * Fitness Routines Page - Create and manage workout routines
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { cacheService } from '../services/cacheService';
import './Fitness.css';

const Fitness = () => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    exercises: [{ name: '', sets: 3, reps: 10 }],
  });

  useEffect(() => {
    loadRoutines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRoutines = async () => {
    try {
      setLoading(true);
      
      // 1. Try cache first
      const cachedRoutines = cacheService.get(`fitness_routines_${user.user_id}`);
      if (cachedRoutines) {
        setRoutines(cachedRoutines);
        setLoading(false);
        return;
      }

      // 2. Fetch from API
      const data = await apiService.getFitnessRoutines(user.user_id);
      const routinesList = Array.isArray(data) ? data : [];
      setRoutines(routinesList);
      
      // 3. Save to cache
      cacheService.set(`fitness_routines_${user.user_id}`, routinesList);
      
    } catch (error) {
      console.error('Error loading routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingRoutine) {
        await apiService.updateFitnessRoutine(editingRoutine.id, formData.name, formData.exercises);
      } else {
        await apiService.createFitnessRoutine(user.user_id, formData.name, formData.exercises);
      }
      
      // Invalidate cache
      cacheService.remove(`fitness_routines_${user.user_id}`);
      cacheService.remove(`dashboard_data_${user.user_id}`);
      
      handleCancelForm();
      loadRoutines();
    } catch (error) {
      console.error('Error saving routine:', error);
      alert('Failed to save routine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRoutine(null);
    setFormData({ name: '', exercises: [{ name: '', sets: 3, reps: 10 }] });
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { name: '', sets: 3, reps: 10 }],
    });
  };

  const removeExercise = (index) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index),
    });
  };

  const updateExercise = (index, field, value) => {
    const newExercises = [...formData.exercises];
    newExercises[index][field] = value;
    setFormData({ ...formData, exercises: newExercises });
  };

  const startEdit = (routine) => {
    setEditingRoutine(routine);
    setFormData({
      name: routine.name,
      exercises: routine.exercises || [{ name: '', sets: 3, reps: 10 }],
    });
    setShowForm(true);
  };

  return (
    <div className="fitness-page">
      <div className="page-header">
        <div>
          <h1>💪 Fitness Routines</h1>
          <p>Create and manage your custom workout plans</p>
        </div>
        <div className="header-actions">
          {showForm && (
            <button className="btn btn-secondary" onClick={handleCancelForm}>
              ✕ Cancel
            </button>
          )}
          <button 
            className="btn btn-primary" 
            onClick={() => {
              if (!showForm) {
                setShowForm(true);
                setEditingRoutine(null);
                setFormData({ name: '', exercises: [{ name: '', sets: 3, reps: 10 }] });
              }
            }}
          >
            ➕ Create Routine
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="card routine-form fade-in">
          <h3>{editingRoutine ? 'Edit Routine' : 'Create New Routine'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Routine Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Morning Workout, Leg Day"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="exercises-section">
              <div className="exercises-header">
                <h4>Exercises</h4>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addExercise}>
                  ➕ Add Exercise
                </button>
              </div>

              {formData.exercises.map((exercise, index) => (
                <div key={index} className="exercise-item">
                  <div className="exercise-number">{index + 1}</div>
                  <div className="exercise-fields">
                    <input
                      type="text"
                      className="input"
                      placeholder="Exercise name"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      className="input"
                      placeholder="Sets"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                      required
                    />
                    <input
                      type="number"
                      className="input"
                      placeholder="Reps"
                      min="1"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value))}
                      required
                    />
                  </div>
                  {formData.exercises.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeExercise(index)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editingRoutine ? 'Update Routine' : 'Create Routine'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Routines List */}
      <div className="routines-grid">
        {loading && <div className="spinner"></div>}
        {!loading && routines.length === 0 && (
          <div className="empty-state card">
            <h3>No routines yet</h3>
            <p>Create your first workout routine to get started!</p>
          </div>
        )}
        {!loading && routines.map((routine) => (
          <div key={routine.id} className="routine-card card">
            <div className="routine-header">
              <h3>{routine.name}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => startEdit(routine)}>
                ✏️ Edit
              </button>
            </div>
            <div className="routine-exercises">
              {routine.exercises?.map((exercise, index) => (
                <div key={index} className="routine-exercise">
                  <span className="exercise-name">{exercise.name}</span>
                  <span className="exercise-details">
                    {exercise.sets} sets × {exercise.reps} reps
                  </span>
                </div>
              ))}
            </div>
            <div className="routine-footer">
              <span className="badge badge-info">{routine.exercises?.length || 0} exercises</span>
              <span className="routine-date">
                Created: {new Date(routine.created_at || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fitness;
