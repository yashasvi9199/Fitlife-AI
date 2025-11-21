/**
 * Health Tracking Page - Track weight, measurements, and health metrics
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';
import { cacheService } from '../services/cacheService';
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
  const [showRecentRecords, setShowRecentRecords] = useState(false); // Collapsed by default
  const [editingRecord, setEditingRecord] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingHealth, setAnalyzingHealth] = useState(false);
  const [savedAnalysis, setSavedAnalysis] = useState(null); // Store analysis when editing
  const formRef = useRef(null);
  const recentRecordsRef = useRef(null);
  
  // Form state for multiple records
  const [multipleRecords, setMultipleRecords] = useState([
    {
      type: 'weight',
      value: '',
      date: new Date().toISOString().split('T')[0],
    }
  ]);

  // Height input state
  const [heightUnit, setHeightUnit] = useState('cm'); // 'cm' or 'feet'
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');

  const healthTypes = [
    { value: 'weight', label: 'Weight', icon: '⚖️', unit: 'kg', placeholder: 'e.g., 70', color: '#EF4444' },
    { value: 'height', label: 'Height', icon: '📏', unit: 'cm', placeholder: 'e.g., 170', color: '#3B82F6' },
    { value: 'steps', label: 'Steps', icon: '👣', unit: 'steps', placeholder: 'e.g., 10000', color: '#10B981' },
    { value: 'heart_rate', label: 'Heart Rate', icon: '❤️', unit: 'bpm', placeholder: 'e.g., 75', color: '#F59E0B' },
    { value: 'blood_pressure', label: 'Blood Pressure', icon: '🩸', unit: 'mmHg', placeholder: 'e.g., 120 (systolic)', color: '#EC4899' },
    { value: 'blood_sugar', label: 'Blood Sugar', icon: '🍬', unit: 'mg/dL', placeholder: 'e.g., 100', color: '#8B5CF6' },
    { value: 'sleep_hours', label: 'Sleep Time', icon: '😴', unit: 'hours', placeholder: 'e.g., 7.5', color: '#6366F1' },
    { value: 'menstruation', label: 'Menstruation Cycle', icon: '🌸', unit: 'day', placeholder: 'Day of cycle (1-28)', color: '#EC4899' },
  ];

  useEffect(() => {
    loadHealthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFilteredRecords(records);
  }, [records]);

  useEffect(() => {
    // Analyze health when records are loaded
    if (records.length > 0 && !aiAnalysis) {
      analyzeHealthData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records]);

  const loadHealthData = async (force = false) => {
    try {
      setLoading(true);
      
      // CACHE DISABLED FOR DEBUGGING
      // Fetch directly from API
      const data = await apiService.getHealthRecords(user.user_id);
      console.log('Raw API response:', data);
      // Sort by created_at (timestamp) to get truly latest records
      const sortedData = Array.isArray(data) ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [];
      console.log('Sorted data:', sortedData);
      
      setRecords(sortedData);

    } catch (error) {
      console.error('Error loading health data:', error);
      showError('Failed to load health records');
    } finally {
      setLoading(false);
    }
  };

  const analyzeHealthData = async () => {
    if (records.length === 0) return;

    try {
      setAnalyzingHealth(true);
      
      // Get latest values for each health metric
      const latestMetrics = {};
      healthTypes.forEach(type => {
        const typeRecords = records
          .filter(r => r.type === type.value)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        if (typeRecords.length > 0) {
          latestMetrics[type.value] = typeRecords[0].value;
          console.log(`Latest ${type.value}:`, typeRecords[0].value, 'from created_at:', typeRecords[0].created_at);
        }
      });

      // Add height to weight data for BMI calculation
      if (latestMetrics.weight && latestMetrics.height) {
        latestMetrics.weight = {
          value: latestMetrics.weight,
          height: latestMetrics.height
        };
      }

      console.log('Sending to AI:', latestMetrics);
      const response = await apiService.analyzeHealth(latestMetrics);
      
      if (response && response.analysis) {
        setAiAnalysis(response.analysis);
      }
    } catch (error) {
      console.error('Error analyzing health:', error);
      // Don't show error to user, just skip analysis
    } finally {
      setAnalyzingHealth(false);
    }
  };

  // ... (analyzeHealthData is already correct)

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare records for submission
      const recordsToSubmit = multipleRecords.map(record => {
        let value = parseFloat(record.value);
        
        // Special handling for height in feet-inches
        if (record.type === 'height' && heightUnit === 'feet') {
          const feet = parseFloat(heightFeet) || 0;
          const inches = parseFloat(heightInches) || 0;
          value = (feet * 30.48) + (inches * 2.54); // Convert to cm
        }
        
        return {
          user_id: user.user_id,
          type: record.type,
          value: value,
          date: record.date
        };
      });

      // Validate all records
      for (const record of recordsToSubmit) {
        const maxValue = record.type === 'steps' ? 100000 : 500;
        if (!isValidNumber(record.value, 0, maxValue)) {
          showError(`Please enter valid values between 0 and ${maxValue}`);
          return;
        }
      }

      if (editingRecord) {
        // Update single record
        await apiService.updateHealthRecord(
          editingRecord.id,
          recordsToSubmit[0].type,
          recordsToSubmit[0].value,
          recordsToSubmit[0].date
        );
        showSuccess('Health record updated successfully!');
      } else {
        // Create multiple records
        await apiService.createHealthRecord(recordsToSubmit);
        showSuccess(`${recordsToSubmit.length} health record(s) saved successfully!`);
      }
      
      // Invalidate cache on update
      cacheService.remove(`health_records_${user.user_id}`);
      cacheService.remove(`health_ai_analysis_${user.user_id}`);
      cacheService.remove(`dashboard_data_${user.user_id}`);

      handleCancelForm();
      await loadHealthData(true); // Force fresh data
      // Re-analyze after new data
      setTimeout(analyzeHealthData, 1000);
    } catch (error) {
      console.error('Error saving health record:', error);
      showError('Failed to save health record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRecord(null);
    setMultipleRecords([{
      type: 'weight',
      value: '',
      date: new Date().toISOString().split('T')[0],
    }]);
    setHeightFeet('');
    setHeightInches('');
    setHeightUnit('cm');
    // Restore saved analysis
    if (savedAnalysis) {
      setAiAnalysis(savedAnalysis);
      setSavedAnalysis(null);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      setLoading(true);
      await apiService.deleteHealthRecord(id);
      
      // Invalidate cache on delete
      cacheService.remove(`health_records_${user.user_id}`);
      cacheService.remove(`health_ai_analysis_${user.user_id}`);
      cacheService.remove(`dashboard_data_${user.user_id}`);
      
      showSuccess('Record deleted successfully!');
      await loadHealthData(true); // Force fresh data
      setTimeout(analyzeHealthData, 1000);
    } catch (error) {
      console.error('Error deleting record:', error);
      showError('Failed to delete record');
    } finally {
      setLoading(false);
    }
  };

  // ... (rest of functions)



  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setMultipleRecords([{
      type: record.type,
      value: record.value.toString(),
      date: record.date.split('T')[0]
    }]);
    setShowForm(true);
    // Save current analysis and hide it
    setSavedAnalysis(aiAnalysis);
    setAiAnalysis(null);
    // Scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const addRecordField = () => {
    setMultipleRecords([...multipleRecords, {
      type: 'weight',
      value: '',
      date: new Date().toISOString().split('T')[0],
    }]);
  };

  const removeRecordField = (index) => {
    setMultipleRecords(multipleRecords.filter((_, i) => i !== index));
  };

  const updateRecordField = (index, field, value) => {
    const updated = [...multipleRecords];
    updated[index][field] = value;
    setMultipleRecords(updated);
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

  const scrollToHistory = () => {
    setShowRecentRecords(true);
    setTimeout(() => {
      recentRecordsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Calculate streaks for each health type
  const calculateStreaks = () => {
    const streaks = {};
    healthTypes.forEach(type => {
      const typeRecords = records
        .filter(r => r.type === type.value)
        .map(r => r.date.split('T')[0])
        .sort()
        .reverse();
      
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (typeRecords.includes(today) || typeRecords.includes(yesterday)) {
        streak = 1;
        let checkDate = new Date(typeRecords.includes(today) ? today : yesterday);
        
        for (let i = 1; i < typeRecords.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          const dateStr = checkDate.toISOString().split('T')[0];
          if (typeRecords.includes(dateStr)) {
            streak++;
          } else {
            break;
          }
        }
      }
      
      streaks[type.value] = {
        streak,
        total: typeRecords.length,
        latest: typeRecords[0] ? records.find(r => r.type === type.value && r.date.split('T')[0] === typeRecords[0])?.value : null
      };
    });
    return streaks;
  };

  const streaks = calculateStreaks();

  // Generate chart data for each metric
  const getChartData = (type) => {
    const typeRecords = records
      .filter(r => r.type === type)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14); // Last 14 records for better trend visibility
    
    return typeRecords.map(r => ({
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: r.value
    }));
  };

  // SVG Line Chart Component
  const LineChart = ({ data, color, height = 100 }) => {
    if (!data || data.length < 2) return <div className="no-chart-data">Not enough data for graph</div>;

    const padding = 20;
    const width = 600; // internal SVG width
    const maxVal = Math.max(...data.map(d => d.value)) * 1.1;
    const minVal = Math.min(...data.map(d => d.value)) * 0.9;
    const range = maxVal - minVal;

    const points = data.map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="line-chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="line-chart-svg">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="#eee" strokeWidth="1" />
          <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#eee" strokeWidth="1" />
          
          {/* The Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="chart-line"
          />
          
          {/* Data Points */}
          {data.map((d, i) => {
             const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
             const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
             return (
               <g key={i} className="chart-point-group">
                 <circle cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="2" />
                 <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fill="#666" className="chart-value-label">
                   {d.value}
                 </text>
                 <text x={x} y={height - 5} textAnchor="middle" fontSize="10" fill="#999">
                   {d.date}
                 </text>
               </g>
             );
          })}
        </svg>
      </div>
    );
  };

  // Helper to render stars
  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading && records.length === 0) {
    return (
      <div className="health-loading">
        <div className="spinner"></div>
        <p>Loading your health data...</p>
      </div>
    );
  }

  return (
    <div className="health-page">
      <div className="page-header">
        <div>
          <h1>❤️ Health Tracking</h1>
          <p>Monitor your health metrics and track your progress</p>
        </div>
        <div className="header-actions-col">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '➕ Add Record'}
          </button>
          <button className="btn-link-subtle" onClick={scrollToHistory}>
            View History ↓
          </button>
        </div>
      </div>

      {/* Top Stats Overview (Compact) - Removed Current Weight */}
      <div className="stats-grid compact-stats">
        <div className="stat-card gradient-primary compact">
          <span className="stat-icon">📊</span>
          <div>
            <p className="stat-label">Total Records</p>
            <p className="stat-value">{records.length}</p>
          </div>
        </div>
        <div className="stat-card gradient-accent compact">
          <span className="stat-icon">📈</span>
          <div>
            <p className="stat-label">This Month</p>
            <p className="stat-value">{records.filter(r => new Date(r.date) > new Date(Date.now() - 30*24*60*60*1000)).length}</p>
          </div>
        </div>
      </div>

      {/* AI Health Analysis Box */}
      {!showForm && (aiAnalysis || analyzingHealth) && (
        <div className="ai-analysis-box">
          <div className="ai-analysis-header">
            <span className="ai-icon">🤖</span>
            <h3>AI Smart Analysis</h3>
          </div>
          
          {analyzingHealth ? (
            <div className="ai-loading">
              <div className="spinner-small"></div>
              <p>Analyzing your health metrics against global standards...</p>
            </div>
          ) : (
            <div className="ai-content">
              <p className="ai-summary">{aiAnalysis.overall_summary}</p>
              
              <div className="ai-metrics-grid">
                {aiAnalysis.metrics?.map((metric, index) => (
                  <div key={index} className="ai-metric-card">
                    <div className="ai-metric-header">
                      <span className="ai-metric-icon">{metric.icon}</span>
                      <h4>{metric.title}</h4>
                    </div>
                    <p className="ai-metric-analysis">{metric.analysis}</p>
                    <div className="ai-metric-rating">
                      <span className="rating-label">Health Score:</span>
                      <span className="stars">{renderStars(metric.rating)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="ai-footer">
                <div className="ai-badge">Powered by Gemini AI • Medical Standard Comparison</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Record Form */}
      {showForm && (
        <div ref={formRef} className="card health-form fade-in">
          <h3>{editingRecord ? 'Edit Health Record' : 'Add Health Records'}</h3>
          <form onSubmit={handleSubmit}>
            {multipleRecords.map((record, index) => (
              <div key={index} className="record-form-group">
                <div className="record-form-header">
                  <h4>Record {index + 1}</h4>
                  {!editingRecord && multipleRecords.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-small"
                      onClick={() => removeRecordField(index)}
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Type</label>
                    <select
                      className="input"
                      value={record.type}
                      onChange={(e) => updateRecordField(index, 'type', e.target.value)}
                    >
                      {healthTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Special handling for height */}
                  {record.type === 'height' ? (
                    <>
                      <div className="form-group">
                        <label className="label">Unit</label>
                        <select
                          className="input"
                          value={heightUnit}
                          onChange={(e) => setHeightUnit(e.target.value)}
                        >
                          <option value="cm">Centimeters (cm)</option>
                          <option value="feet">Feet & Inches</option>
                        </select>
                      </div>
                      {heightUnit === 'cm' ? (
                        <div className="form-group">
                          <label className="label">Height (cm)</label>
                          <input
                            type="number"
                            step="0.1"
                            className="input"
                            placeholder="e.g., 170"
                            value={record.value}
                            onChange={(e) => updateRecordField(index, 'value', e.target.value)}
                            required
                          />
                        </div>
                      ) : (
                        <>
                          <div className="form-group">
                            <label className="label">Feet</label>
                            <input
                              type="number"
                              className="input"
                              placeholder="e.g., 5"
                              value={heightFeet}
                              onChange={(e) => setHeightFeet(e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="label">Inches</label>
                            <input
                              type="number"
                              step="0.1"
                              className="input"
                              placeholder="e.g., 8"
                              value={heightInches}
                              onChange={(e) => setHeightInches(e.target.value)}
                              required
                            />
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="form-group">
                      <label className="label">
                        Value ({healthTypes.find(t => t.value === record.type)?.unit || ''})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        placeholder={healthTypes.find(t => t.value === record.type)?.placeholder || 'Enter value'}
                        value={record.value}
                        onChange={(e) => updateRecordField(index, 'value', e.target.value)}
                        required
                      />
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label className="label">Date</label>
                    <input
                      type="date"
                      className="input"
                      value={record.date}
                      onChange={(e) => updateRecordField(index, 'date', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {!editingRecord && (
              <button type="button" className="btn btn-secondary" onClick={addRecordField}>
                ➕ Add Another Record
              </button>
            )}
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editingRecord ? 'Update Record' : 'Save Records'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Health Metrics Tiles (Latest Values) */}
      <div className="card">
        <h3>📊 Latest Metrics</h3>
        <div className="health-metrics-grid">
          {healthTypes.map(type => {
            const streak = streaks[type.value];
            
            return (
              <div key={type.value} className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon">{type.icon}</span>
                  <div>
                    <h4>{type.label}</h4>
                    <p className="metric-streak">
                      🔥 {streak.streak} day streak
                    </p>
                  </div>
                </div>
                <div className="metric-value-large">
                  {streak.latest !== null ? (
                    <>
                      <span className="value">{streak.latest}</span>
                      <span className="unit">{type.unit}</span>
                    </>
                  ) : (
                    <span className="no-data">No data</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Trends Graphs Section */}
      <div className="trends-section">
        <h3>📈 Health Trends & Progress</h3>
        <div className="trends-grid">
          {healthTypes.map(type => {
            const chartData = getChartData(type.value);
            if (chartData.length < 2) return null; // Only show if we have data

            return (
              <div key={type.value} className="trend-card card">
                <div className="trend-header">
                  <span className="trend-icon">{type.icon}</span>
                  <h4>{type.label} Progress</h4>
                </div>
                <div className="trend-chart-wrapper">
                  <LineChart data={chartData} color={type.color} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Records - Collapsible */}
      <div className="card recent-records-section" ref={recentRecordsRef}>
        <div 
          className="card-header-collapsible" 
          onClick={() => setShowRecentRecords(!showRecentRecords)}
        >
          <h3>Recent Records History</h3>
          <button className="collapse-btn">
            {showRecentRecords ? '▼' : '▶'}
          </button>
        </div>
        
        {showRecentRecords && (
          <div className="fade-in">
            {records.length > 0 && (
              <SearchInput
                placeholder="Search records..."
                onSearch={handleSearch}
              />
            )}
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
                {filteredRecords.slice(0, 20).map((record, index) => {
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
                      <div className="record-actions">
                        <button 
                          className="btn-icon" 
                          onClick={() => handleEditRecord(record)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleDeleteRecord(record.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Health;
