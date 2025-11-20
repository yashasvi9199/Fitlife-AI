/**
 * Profile Page - User profile management
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: '',
    gender: '',
    city: '',
    state: '',
    country: '',
    mobile: user?.mobile || '',
  });

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await apiService.getUserProfile(user.user_id);
      setFormData({
        name: profileData.name || user?.name || '',
        age: profileData.age || '',
        gender: profileData.gender || '',
        city: profileData.city || '',
        state: profileData.state || '',
        country: profileData.country || '',
        mobile: profileData.mobile || user?.mobile || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiService.updateUserProfile(user.user_id, formData);
      updateUser(formData);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>👤 Profile</h1>
          <p>Manage your account information</p>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      <div className="profile-container">
        {/* Profile Card */}
        <div className="card profile-card">
          <div className="profile-avatar gradient-primary">
            {formData.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h2>{formData.name || 'User'}</h2>
          <p className="profile-mobile">{formData.mobile}</p>
          
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="stat-icon">❤️</span>
              <p className="stat-value">0</p>
              <p className="stat-label">Health Records</p>
            </div>
            <div className="profile-stat">
              <span className="stat-icon">💪</span>
              <p className="stat-value">0</p>
              <p className="stat-label">Workouts</p>
            </div>
            <div className="profile-stat">
              <span className="stat-icon">🎯</span>
              <p className="stat-value">0</p>
              <p className="stat-label">Goals</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="card profile-details">
          {!editing ? (
            <div className="details-view">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name</label>
                  <p>{formData.name || 'Not set'}</p>
                </div>
                <div className="info-item">
                  <label>Age</label>
                  <p>{formData.age || 'Not set'}</p>
                </div>
                <div className="info-item">
                  <label>Gender</label>
                  <p>{formData.gender || 'Not set'}</p>
                </div>
                <div className="info-item">
                  <label>Mobile</label>
                  <p>{formData.mobile || 'Not set'}</p>
                </div>
                <div className="info-item">
                  <label>City</label>
                  <p>{formData.city || 'Not set'}</p>
                </div>
                <div className="info-item">
                  <label>State</label>
                  <p>{formData.state || 'Not set'}</p>
                </div>
                <div className="info-item">
                  <label>Country</label>
                  <p>{formData.country || 'Not set'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="details-edit">
              <h3>Edit Personal Information</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="label">Name</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Age</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Gender</label>
                    <select
                      className="input"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Mobile</label>
                    <input
                      type="tel"
                      className="input"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">City</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">State</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Country</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : '💾 Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(false);
                      loadProfile();
                    }}
                  >
                    ✕ Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
