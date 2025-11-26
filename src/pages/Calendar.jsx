/**
 * Calendar Page - Schedule and track workout events
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import './Calendar.css';

const Calendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  // Get local date without timezone offset
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'workout',
    date: getLocalDateString(),
  });

  const eventTypes = [
    { value: 'workout', label: 'Workout', icon: '💪', color: '#0EA5E9' },
    { value: 'cardio', label: 'Cardio', icon: '🏃', color: '#10B981' },
    { value: 'yoga', label: 'Yoga', icon: '🧘', color: '#8B5CF6' },
    { value: 'rest', label: 'Rest Day', icon: '😴', color: '#F59E0B' },
    { value: 'meal', label: 'Meal Plan', icon: '🍎', color: '#EF4444' },
  ];

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCalendarEvents(user.user_id, selectedDate);
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiService.createCalendarEvent(
        user.user_id,
        formData.title,
        formData.type,
        formData.date
      );
      setShowForm(false);
      setFormData({ title: '', type: 'workout', date: selectedDate });
      loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleEventComplete = async (event) => {
    try {
      await apiService.updateCalendarEvent(event.id, !event.completed);
      loadEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const getEventTypeInfo = (type) => {
    return eventTypes.find(t => t.value === type) || eventTypes[0];
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const dateStr = getLocalDateString(dayDate);
      days.push({
        day: i,
        isCurrentMonth: true,
        date: dateStr,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const currentMonthYear = new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="calendar-page">
      <div className="page-header">
        <div>
          <h1>📅 Calendar</h1>
          <p>Schedule and track your fitness activities</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '➕ Add Event'}
        </button>
      </div>

      {/* Add Event Form */}
      {showForm && (
        <div className="card event-form fade-in">
          <h3>Add Event</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Event Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Morning Run"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
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
              {loading ? 'Creating...' : 'Add Event'}
            </button>
          </form>
        </div>
      )}

      <div className="calendar-container">
        {/* Calendar View */}
        <div className="card calendar-card">
          <div className="calendar-header">
            <h3>{currentMonthYear}</h3>
            <div className="calendar-nav">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const date = new Date(selectedDate);
                  date.setMonth(date.getMonth() - 1);
                  setSelectedDate(date.toISOString().split('T')[0]);
                }}
              >
                ← Prev
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedDate(getLocalDateString())}
              >
                Today
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const date = new Date(selectedDate);
                  date.setMonth(date.getMonth() + 1);
                  setSelectedDate(date.toISOString().split('T')[0]);
                }}
              >
                Next →
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
            {calendarDays.map((dayInfo, index) => (
              <div
                key={index}
                className={`calendar-day ${!dayInfo.isCurrentMonth ? 'inactive' : ''} ${dayInfo.date === selectedDate ? 'selected' : ''}`}
                onClick={() => dayInfo.isCurrentMonth && setSelectedDate(dayInfo.date)}
              >
                {dayInfo.day}
              </div>
            ))}
          </div>
        </div>

        {/* Events for Selected Date */}
        <div className="card events-card">
          <h3>Events for {new Date(selectedDate).toLocaleDateString()}</h3>
          {loading && <div className="spinner"></div>}
          {!loading && events.length === 0 && (
            <div className="empty-state">
              <p>No events scheduled for this day</p>
            </div>
          )}
          {!loading && events.length > 0 && (
            <div className="events-list">
              {events.map((event) => {
                const typeInfo = getEventTypeInfo(event.type);
                return (
                  <div key={event.id} className={`event-item ${event.completed ? 'completed' : ''}`}>
                    <div className="event-icon" style={{ background: typeInfo.color }}>
                      {typeInfo.icon}
                    </div>
                    <div className="event-info">
                      <p className="event-title">{event.title}</p>
                      <p className="event-type">{typeInfo.label}</p>
                    </div>
                    <button
                      className={`btn btn-sm ${event.completed ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => toggleEventComplete(event)}
                    >
                      {event.completed ? '✓ Done' : 'Mark Done'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
