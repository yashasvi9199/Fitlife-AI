/**
 * Dashboard Page - Main overview page
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { cacheService } from '../services/cacheService';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    healthCount: 0,
    routineCount: 0,
    goalCount: 0,
    streak: 0,
    weeklyActivity: [],
    recentActivity: [],
    bmi: null,
    bmiStatus: '',
    latestWeight: null
  });
  const [loading, setLoading] = useState(true);

  const [quote, setQuote] = useState({
    text: "The only bad workout is the one that didn't happen.",
    author: "Unknown"
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
      fetchMotivation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMotivation = async () => {
    try {
      // Try cache first for quote to avoid too many API calls on nav
      const cachedQuote = cacheService.get('daily_quote');
      if (cachedQuote) {
        setQuote(cachedQuote);
        return;
      }

      const data = await apiService.getMotivationQuote();
      if (data && data.quote) {
        const newQuote = { text: data.quote, author: data.author || 'Unknown' };
        setQuote(newQuote);
        // Cache for 1 hour so it refreshes occasionally but not every click
        cacheService.set('daily_quote', newQuote, 60); 
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Try cache first (optional, can be skipped if we want fresh data always)
      // For "energetic" feel, maybe we want fresh data to show latest updates immediately.
      // But let's keep cache for speed, and maybe re-fetch in background if needed.
      // const cachedData = cacheService.get(`dashboard_data_${user.user_id}`);
      // if (cachedData) {
      //   setData(cachedData);
      //   setLoading(false);
      // }

      // 2. Fetch all data in parallel
      const [healthData, routinesData, goalsData] = await Promise.all([
        apiService.getHealthRecords(user.user_id), 
        apiService.getFitnessRoutines(user.user_id),
        apiService.getGoals(user.user_id)
      ]);

      // Process Health Data
      const healthRecords = Array.isArray(healthData) ? healthData : [];
      
      // Process Routines
      const routines = Array.isArray(routinesData) ? routinesData : [];
      
      // Process Goals
      const goals = Array.isArray(goalsData) ? goalsData : [];

      // Calculate Streak
      const sortedDates = [...new Set(healthRecords.map(r => r.date.split('T')[0]))].sort().reverse();
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
        currentStreak = 1;
        let checkDate = new Date(sortedDates.includes(today) ? today : yesterday);
        for (let i = 1; i < sortedDates.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          const dateStr = checkDate.toISOString().split('T')[0];
          if (sortedDates.includes(dateStr)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calculate Weekly Activity
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });

      const weeklyActivity = last7Days.map(date => {
        const dayRecords = healthRecords.filter(r => r.date.startsWith(date));
        const isActive = dayRecords.length > 0;
        return {
          day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: dayRecords.length,
          isActive,
          date
        };
      });

      // Recent Activity Feed
      const allActivities = [
        ...healthRecords.map(r => {
          let desc = `Logged ${r.type}: ${r.value}`;
          if (r.type === 'weight') desc = `Logged weight: ${r.value}kg`;
          else if (r.type === 'steps') desc = `Walked ${r.value} steps`;
          else if (r.type === 'height') desc = `Recorded height: ${r.value}cm`;
          else if (r.type === 'heart_rate') desc = `Heart Rate: ${r.value} bpm`;
          else desc = `Logged ${r.type}: ${r.value}`;
          
          return { 
            type: 'health', 
            date: r.created_at || r.date, 
            title: 'Health Check', 
            desc 
          };
        }),
        ...routines.map(r => ({ type: 'routine', date: r.created_at, title: 'New Routine', desc: r.name })),
        ...goals.map(r => ({ type: 'goal', date: r.created_at, title: 'New Goal', desc: r.description }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      // BMI Calculation
      let bmi = null;
      let bmiStatus = '';
      let latestWeight = null;
      
      // Find latest weight and height records
      const weightRecords = healthRecords.filter(r => r.type === 'weight').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const heightRecords = healthRecords.filter(r => r.type === 'height').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (weightRecords.length > 0) {
        latestWeight = weightRecords[0].value;
        
        if (heightRecords.length > 0) {
          const heightVal = heightRecords[0].value;
          const heightInMeters = heightVal / 100;
          bmi = (latestWeight / (heightInMeters * heightInMeters)).toFixed(1);
          
          if (bmi < 18.5) bmiStatus = 'Underweight';
          else if (bmi < 25) bmiStatus = 'Healthy';
          else if (bmi < 30) bmiStatus = 'Overweight';
          else bmiStatus = 'Obese';
        }
      }

      // Find latest sleep record
      const sleepRecords = healthRecords.filter(r => r.type === 'sleep_hours').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const latestSleep = sleepRecords.length > 0 ? sleepRecords[0].value : null;

      const dashboardData = {
        healthCount: healthRecords.length,
        routineCount: routines.length,
        goalCount: goals.length,
        streak: currentStreak,
        weeklyActivity,
        recentActivity: allActivities,
        bmi,
        bmiStatus,
        latestWeight,
        latestSleep
      };

      setData(dashboardData);
      cacheService.set(`dashboard_data_${user.user_id}`, dashboardData);

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

  // Helper for circular progress
  const CircularProgress = ({ value, max, color, icon, label, subLabel, onClick, delay }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(value / max, 1);
    const dashoffset = circumference - progress * circumference;

    return (
      <div 
        className="stat-card-circular animate-slide-up" 
        onClick={onClick} 
        style={{ cursor: 'pointer', animationDelay: delay }}
      >
        <div className="circular-chart-container">
          <svg className="circular-chart" viewBox="0 0 80 80">
            <path
              className="circle-bg"
              d="M40,40 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0"
            />
            <path
              className="circle"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              stroke={color}
              d="M40,40 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0"
            />
          </svg>
          <div className="circle-content">
            <span className="circle-icon">{icon}</span>
            <span className="circle-value">{value}</span>
          </div>
        </div>
        <div className="stat-info">
          <h3>{label}</h3>
          <p>{subLabel}</p>
        </div>
      </div>
    );
  };

  // Premium SVG Line Chart Component
  const StreakLineChart = ({ data }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    
    if (!data || data.length === 0) return null;

    const height = 200;
    const width = 800;
    const padding = 40;
    
    const maxCount = Math.max(...data.map(d => d.count), 5);
    const points = data.map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - (d.count / maxCount) * (height - 2 * padding);
      return { x, y, ...d };
    });

    const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x},${p.y}`).join(' ');
    const areaPathD = `${pathD} L${points[points.length-1].x},${height-padding} L${points[0].x},${height-padding} Z`;

    return (
      <div className="streak-chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="streak-svg">
          <defs>
            <linearGradient id="streakGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((tick, i) => {
            const y = height - padding - tick * (height - 2 * padding);
            return (
              <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
            );
          })}
          <path d={areaPathD} fill="url(#streakGradient)" />
          <path d={pathD} fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="chart-line-path" />
          {points.map((p, i) => (
            <g key={i} onMouseEnter={() => setHoveredPoint(p)} onMouseLeave={() => setHoveredPoint(null)} onClick={() => setHoveredPoint(p)} style={{ cursor: 'pointer' }}>
              <circle cx={p.x} cy={p.y} r="15" fill="transparent" />
              <circle cx={p.x} cy={p.y} r={hoveredPoint === p ? 6 : 4} fill="#1F2937" stroke="#F59E0B" strokeWidth="2" className="chart-point" />
              <text x={p.x} y={height - 10} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="12">{p.day}</text>
            </g>
          ))}
        </svg>
        {hoveredPoint && (
          <div className="chart-tooltip" style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%` }}>
            <div className="tooltip-date">{hoveredPoint.fullDate}</div>
            <div className="tooltip-value"><strong>{hoveredPoint.count}</strong> activities</div>
            <div className="tooltip-status">{hoveredPoint.count > 0 ? '🔥 Active' : '💤 Rest'}</div>
          </div>
        )}
      </div>
    );
  };

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header animate-fade-in">
        <div>
          <h1>{getGreeting()}, {user?.name || 'Fitnesser'}! 👋</h1>
          <p className="dashboard-subtitle">Ready to crush your fitness goals today?</p>
        </div>
        <div className="current-date">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <CircularProgress value={data.healthCount} max={50} color="#EF4444" icon="❤️" label="Health Records" subLabel="Total tracked" onClick={() => navigate('/health')} delay="0.1s" />
        <CircularProgress value={data.routineCount} max={10} color="#3B82F6" icon="💪" label="Routines" subLabel="Active plans" onClick={() => navigate('/fitness')} delay="0.2s" />
        <CircularProgress value={data.goalCount} max={5} color="#F59E0B" icon="🎯" label="Goals" subLabel="In progress" onClick={() => navigate('/goals')} delay="0.3s" />
        {data.latestSleep && (
          <CircularProgress value={data.latestSleep} max={10} color="#6366F1" icon="😴" label="Sleep" subLabel="Latest duration" onClick={() => navigate('/health')} delay="0.4s" />
        )}
      </div>

      <div className="dashboard-main-layout">
        {/* Left Column */}
        <div className="dashboard-left-col">
          
          {/* Streak Chart */}
          <div className="chart-section card animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="chart-header">
              <h3>🔥 Streak Activity (Last 7 Days)</h3>
              <div className="streak-badge">Current Streak: <strong>{data.streak} days</strong></div>
            </div>
            <div className="line-chart-wrapper">
              <StreakLineChart data={data.weeklyActivity} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h3>⚡ Quick Actions</h3>
            <div className="quick-actions-grid">
              <div className="action-card" onClick={() => navigate('/health')}>
                <span className="action-icon">⚖️</span>
                <span className="action-label">Log Weight</span>
              </div>
              <div className="action-card" onClick={() => navigate('/fitness')}>
                <span className="action-icon">🏋️‍♂️</span>
                <span className="action-label">Start Workout</span>
              </div>
              <div className="action-card" onClick={() => navigate('/goals')}>
                <span className="action-icon">🎯</span>
                <span className="action-label">Add Goal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right-col">
          
          {/* BMI Widget */}
          {data.bmi && (
            <div className="bmi-widget card animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="widget-header">
                <h3>Body Mass Index</h3>
                <span className={`status-badge ${data.bmiStatus.toLowerCase()}`}>{data.bmiStatus}</span>
              </div>
              <div className="bmi-value-container">
                <span className="bmi-value">{data.bmi}</span>
                <span className="bmi-unit">BMI</span>
              </div>
              <div className="bmi-scale">
                <div className="scale-marker" style={{ left: `${Math.min(Math.max((data.bmi - 15) / 20 * 100, 0), 100)}%` }}></div>
              </div>
              <p className="bmi-subtitle">Based on latest weight: {data.latestWeight}kg</p>
            </div>
          )}

          {/* Recent Activity */}
          <div className="recent-activity card animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <h3>🕒 Recent Activity</h3>
            <div className="activity-list">
              {data.recentActivity.length > 0 ? (
                data.recentActivity.map((item, index) => (
                  <div key={index} className="activity-item">
                    <div className={`activity-icon ${item.type}`}>
                      {item.type === 'health' ? '❤️' : item.type === 'routine' ? '💪' : '🎯'}
                    </div>
                    <div className="activity-details">
                      <span className="activity-title">{item.title}</span>
                      <span className="activity-desc">{item.desc}</span>
                    </div>
                    <span className="activity-time">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="no-activity">No recent activity recorded.</p>
              )}
            </div>
          </div>

          {/* Motivation Quote */}
          <div className="motivation-card animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <div className="motivation-icon">✨</div>
            <div className="motivation-content">
              <h3>Daily Motivation</h3>
          <p className="motivation-quote">"{quote.text}"</p>
          <p className="motivation-author">- {quote.author}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
