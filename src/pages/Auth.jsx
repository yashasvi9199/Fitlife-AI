/**
 * Auth Page - Login and Signup with complete profile fields
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (isLogin) {
      if (loginMethod === 'email' && !email) {
        setError('Please enter your email');
        return;
      }
      if (loginMethod === 'phone' && (!mobile || mobile.length < 10)) {
        setError('Please enter a valid mobile number');
        return;
      }
    } else {
      // Signup Validation
      if (!name) { setError('Please enter your name'); return; }
      if (!email) { setError('Please enter your email'); return; }
      if (!mobile || mobile.length < 10) { setError('Please enter a valid mobile number'); return; }
      if (!age) { setError('Please enter your age'); return; }
      if (!gender) { setError('Please select your gender'); return; }
      if (!city) { setError('Please enter your city'); return; }
      if (!state) { setError('Please enter your state'); return; }
      if (!country) { setError('Please enter your country'); return; }
    }

    setLoading(true);

    try {
      const userId = 'caf3a9be-b38c-4014-a472-207a1948082e'; // Supabase Auth user (Hardcoded for demo)

      if (!isLogin) {
        // Signup: Create/Update profile with all details
        try {
          const profileData = {
            name,
            mobile,
            age: parseInt(age),
            gender,
            city,
            state,
            country
            // Email is not stored in profiles table based on schema, but we collect it
          };

          // Try to create first, if fails (duplicate), update
          try {
             await apiService.createUserProfile(userId, profileData);
          } catch (createError) {
             console.log('Create failed, trying update...', createError);
             await apiService.updateUserProfile(userId, profileData);
          }
          
          login({
            user_id: userId,
            ...profileData,
            email // Store email in local auth state
          });
          
          showSuccess('Account created successfully!');
        } catch (err) {
          console.error('Signup error:', err);
          showError('Failed to create account. Please try again.');
          setLoading(false);
          return;
        }
      } else {
        // Login
        // In a real app, we would verify credentials here.
        // For this demo, we just fetch the profile if it exists, or log them in with provided details.
        
        try {
          const profile = await apiService.getUserProfile(userId);
          login({
            user_id: userId,
            ...profile,
            email: email || (profile && profile.email) // Use entered email or profile email if exists
          });
        } catch (err) {
           // If profile doesn't exist, just log them in with what we have
           login({
            user_id: userId,
            name: 'User',
            email,
            mobile
           });
        }
        
        showSuccess('Welcome back!');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-blob blob-1"></div>
        <div className="auth-blob blob-2"></div>
        <div className="auth-blob blob-3"></div>
      </div>

      <div className="auth-content">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="brand-logo">
            <span className="brand-icon">💪</span>
            <h1 className="brand-name text-gradient">FitLife AI</h1>
          </div>
          <h2 className="brand-tagline">Your Personal Fitness Companion</h2>
          <p className="brand-description">
            Track your health, build routines, achieve goals, and get AI-powered nutrition insights
          </p>
          
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">❤️</span>
              <span className="feature-text">Health Tracking</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💪</span>
              <span className="feature-text">Custom Workouts</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span className="feature-text">Goal Setting</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span className="feature-text">AI Food Analysis</span>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="auth-form-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2>{isLogin ? 'Welcome Back!' : 'Get Started'}</h2>
              <p>{isLogin ? 'Login to continue your fitness journey' : 'Create your account to begin'}</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Login Method Toggle */}
              {isLogin && (
                <div className="login-method-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${loginMethod === 'email' ? 'active' : ''}`}
                    onClick={() => setLoginMethod('email')}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${loginMethod === 'phone' ? 'active' : ''}`}
                    onClick={() => setLoginMethod('phone')}
                  >
                    Phone
                  </button>
                </div>
              )}

              {/* Signup Fields */}
              {!isLogin && (
                <>
                  <div className="form-group">
                    <label className="label" htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      className="input"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              {/* Email Field - Show if Signup OR (Login AND Email method) */}
              {(!isLogin || (isLogin && loginMethod === 'email')) && (
                <div className="form-group">
                  <label className="label" htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Phone Field - Show if Signup OR (Login AND Phone method) */}
              {(!isLogin || (isLogin && loginMethod === 'phone')) && (
                <div className="form-group">
                  <label className="label" htmlFor="mobile">Mobile Number</label>
                  <input
                    id="mobile"
                    type="tel"
                    className="input"
                    placeholder="+91 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Additional Signup Fields */}
              {!isLogin && (
                <div className="signup-grid">
                  <div className="form-group">
                    <label className="label" htmlFor="age">Age</label>
                    <input
                      id="age"
                      type="number"
                      className="input"
                      placeholder="25"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      className="input"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="city">City</label>
                    <input
                      id="city"
                      type="text"
                      className="input"
                      placeholder="New York"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="state">State</label>
                    <input
                      id="state"
                      type="text"
                      className="input"
                      placeholder="NY"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="label" htmlFor="country">Country</label>
                    <input
                      id="country"
                      type="text"
                      className="input"
                      placeholder="USA"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-lg auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{isLogin ? 'Login' : 'Sign Up'}</span>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  className="link-button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  disabled={loading}
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </div>
          </div>

          <p className="auth-disclaimer">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
