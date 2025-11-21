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
    weeklyActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Try cache first
      const cachedData = cacheService.get(`dashboard_data_${user.user_id}`);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        // We can return here, but for dashboard it might be good to fetch fresh in background?
        // User said "until user force refresh", so we return.
        return;
      }

      // 2. Fetch all data in parallel
      // Using getHealthRecords to get all data for accurate streak calculation
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

      // Calculate Streak (consecutive days with health records)
      const sortedDates = [...new Set(healthRecords.map(r => r.date.split('T')[0]))].sort().reverse();
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      // Check if active today or yesterday to start streak
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

      // Calculate Weekly Activity for Bar Chart (Past 7 Days)
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

      const dashboardData = {
        healthCount: healthRecords.length,
        routineCount: routines.length,
        goalCount: goals.length,
        streak: currentStreak,
        weeklyActivity
      };

      setData(dashboardData);
      
      // 3. Save to cache
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
  const CircularProgress = ({ value, max, color, icon, label, subLabel, onClick }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(value / max, 1);
    const dashoffset = circumference - progress * circumference;

    return (
      <div className="stat-card-circular" onClick={onClick} style={{ cursor: 'pointer' }}>
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
    const width = 800; // Internal SVG coordinate width
    const padding = 40;
    
    // Calculate scales
    const maxCount = Math.max(...data.map(d => d.count), 5); // Min max of 5 for scale
    const points = data.map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - (d.count / maxCount) * (height - 2 * padding);
      return { x, y, ...d };
    });

    // Create path string
    const pathD = points.map((p, i) => 
      (i === 0 ? 'M' : 'L') + `${p.x},${p.y}`
    ).join(' ');

    // Create area path for gradient
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

          {/* Grid Lines */}
          {[0, 0.5, 1].map((tick, i) => {
            const y = height - padding - tick * (height - 2 * padding);
            return (
              <line 
                key={i} 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="rgba(255,255,255,0.1)" 
                strokeWidth="1" 
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaPathD} fill="url(#streakGradient)" />

          {/* Line Path */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="#F59E0B" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="chart-line-path"
          />

          {/* Interactive Points */}
          {points.map((p, i) => (
            <g 
              key={i} 
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
              onClick={() => setHoveredPoint(p)} // For touch devices
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible larger target for easier hovering */}
              <circle cx={p.x} cy={p.y} r="15" fill="transparent" />
              
              {/* Visible Point */}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={hoveredPoint === p ? 6 : 4} 
                fill="#1F2937" 
                stroke="#F59E0B" 
                strokeWidth="2"
                className="chart-point"
              />
              
              {/* X-Axis Label */}
              <text 
                x={p.x} 
                y={height - 10} 
                textAnchor="middle" 
                fill="rgba(255,255,255,0.6)" 
                fontSize="12"
              >
                {p.day}
              </text>
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div 
            className="chart-tooltip"
            style={{ 
              left: `${(hoveredPoint.x / width) * 100}%`, 
              top: `${(hoveredPoint.y / height) * 100}%` 
            }}
          >
            <div className="tooltip-date">{hoveredPoint.fullDate}</div>
            <div className="tooltip-value">
              <strong>{hoveredPoint.count}</strong> activities
            </div>
            <div className="tooltip-status">
              {hoveredPoint.count > 0 ? '🔥 Active' : '💤 Rest'}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard">
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

      {/* Stats Grid with Circular Charts */}
      <div className="stats-grid">
        <CircularProgress 
          value={data.healthCount} 
          max={50} 
          color="#EF4444" 
          icon="❤️" 
          label="Health Records" 
          subLabel="Total tracked" 
          onClick={() => navigate('/health')}
        />
        <CircularProgress 
          value={data.routineCount} 
          max={10} 
          color="#3B82F6" 
          icon="💪" 
          label="Routines" 
          subLabel="Active plans" 
          onClick={() => navigate('/fitness')}
        />
        <CircularProgress 
          value={data.goalCount} 
          max={5} 
          color="#F59E0B" 
          icon="🎯" 
          label="Goals" 
          subLabel="In progress" 
          onClick={() => navigate('/goals')}
        />
      </div>

      {/* Streak Activity Line Chart */}
      <div className="chart-section card">
        <div className="chart-header">
          <h3>🔥 Streak Activity (Last 7 Days)</h3>
          <div className="streak-badge">
            Current Streak: <strong>{data.streak} days</strong>
          </div>
        </div>
        <div className="line-chart-wrapper">
          <StreakLineChart data={data.weeklyActivity} />
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
