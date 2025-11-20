/**
 * Health Tracking Page - Track weight, measurements, and health metrics
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';
import SearchInput from '../components/common/SearchInput';
import { sanitizeString, isValidNumber } from '../utils/helpers';
import './Health.css';

const Health = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'weight',
    value: '',
    date: new Date().toISOString().split('T')[0],
  });

  const healthTypes = [
    { value: 'weight', label: 'Weight', icon: '⚖️', unit: 'kg', placeholder: 'e.g., 70' },
    { value: 'height', label: 'Height', icon: '📏', unit: 'cm', placeholder: 'e.g., 170' },
    { value: 'steps', label: 'Steps', icon: '👣', unit: 'steps', placeholder: 'e.g., 10000' },
    { value: 'heart_rate', label: 'Heart Rate', icon: '❤️', unit: 'bpm', placeholder: 'e.g., 75' },
    { value: 'blood_pressure', label: 'Blood Pressure', icon: '🩸', unit: 'mmHg', placeholder: 'e.g., 120 (systolic)' },
    { value: 'blood_sugar', label: 'Blood Sugar', icon: '🍬', unit: 'mg/dL', placeholder: 'e.g., 100' },
    { value: 'sleep_hours', label: 'Sleep Time', icon: '😴', unit: 'hours', placeholder: 'e.g., 7.5' },
    { value: 'menstruation', label: 'Menstruation Cycle', icon: '🌸', unit: 'day', placeholder: 'Day of cycle (1-28)' },
  ];

  useEffect(() => {
    loadHealthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFilteredRecords(records);
  }, [records]);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      // Load all health records (not just weight)
      const allRecords = await apiService.getHealthRecords(user.user_id);
      // API returns array directly, not wrapped in { records: [] }
      setRecords(Array.isArray(allRecords) ? allRecords : []);
    } catch (error) {
      console.error('Error loading health data:', error);
      showError('Failed to load health records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    const value = parseFloat(formData.value);
    if (!isValidNumber(value, 0, 500)) {
      showError('Please enter a valid value between 0 and 500');
      return;
    }

    try {
      setLoading(true);
      await apiService.createHealthRecord(
        user.user_id,
        formData.type,
        value,
        formData.date
      );
      setShowForm(false);
      setFormData({ type: 'weight', value: '', date: new Date().toISOString().split('T')[0] });
      loadHealthData();
      showSuccess('Health record saved successfully!');
    } catch (error) {
      console.error('Error creating health record:', error);
      showError('Failed to save health record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    const cleanQuery = sanitizeString(query.toLowerCase());
    if (!cleanQuery) {
      setFilteredRecords(records);
      return;
    }
    
    const filtered = records.filter(record =>
      record.type.toLowerCase().includes(cleanQuery) ||
      record.value.toString().includes(cleanQuery)
    );
    setFilteredRecords(filtered);
  };

  return (
    <div className="health-page">
      <div className="page-header">
        <div>
          <h1>❤️ Health Tracking</h1>
          <p>Monitor your health metrics and track your progress</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '➕ Add Record'}
        </button>
      </div>

      {/* Add Record Form */}
      {showForm && (
        <div className="card health-form fade-in">
          <h3>Add Health Record</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {healthTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">
                  Value ({healthTypes.find(t => t.value === formData.type)?.unit || ''})
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  placeholder={healthTypes.find(t => t.value === formData.type)?.placeholder || 'Enter value'}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Record'}
            </button>
          </form>
        </div>
      )}

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card gradient-primary">
          <span className="stat-icon">📊</span>
          <div>
            <p className="stat-label">Total Records</p>
            <p className="stat-value">{records.length}</p>
          </div>
        </div>
        <div className="stat-card gradient-accent">
          <span className="stat-icon">📈</span>
          <div>
            <p className="stat-label">This Month</p>
            <p className="stat-value">{records.filter(r => new Date(r.date) > new Date(Date.now() - 30*24*60*60*1000)).length}</p>
          </div>
        </div>
        <div className="stat-card gradient-energy">
          <span className="stat-icon">🎯</span>
          <div>
            <p className="stat-label">Average Weight</p>
            <p className="stat-value">
              {records.length > 0 
                ? (records.reduce((sum, r) => sum + r.value, 0) / records.length).toFixed(1) 
                : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="card">
        <div className="card-header-with-search">
          <h3>Recent Records</h3>
          {records.length > 0 && (
            <SearchInput
              placeholder="Search records..."
              onSearch={handleSearch}
            />
          )}
        </div>
        {loading && <div className="spinner"></div>}
        {!loading && records.length === 0 && (
          <div className="empty-state">
            <p>No health records yet. Add your first record to start tracking!</p>
          </div>
        )}
        {!loading && filteredRecords.length === 0 && records.length > 0 && (
          <div className="empty-state">
            <p>No records match your search.</p>
          </div>
        )}
        {!loading && filteredRecords.length > 0 && (
          <div className="records-list">
            {filteredRecords.slice(0, 10).map((record, index) => {
              const typeInfo = healthTypes.find(t => t.value === record.type) || { 
                icon: '📊', 
                label: record.type, 
                unit: '' 
              };
              
              return (
                <div key={record.id || index} className="record-item">
                  <div className="record-icon">{typeInfo.icon}</div>
                  <div className="record-info">
                    <p className="record-value">{record.value} {typeInfo.unit}</p>
                    <p className="record-date">{new Date(record.date).toLocaleDateString()}</p>
                  </div>
                  <div className="record-badge">
                    <span className="badge badge-info">{typeInfo.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Health;
