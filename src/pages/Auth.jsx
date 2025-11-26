/**
 * Auth Page - Login and Signup with complete profile fields
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';
import authService from '../services/supabase';
import AuthLoading from '../components/common/AuthLoading';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [finishingAnimation, setFinishingAnimation] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (isLogin) {
      if (!email) {
        setError('Please enter your email');
        return;
      }
      if (!password) {
        setError('Please enter your password');
        return;
      }
    } else {
      // Signup Validation
      if (!name) { setError('Please enter your name'); return; }
      if (!email) { setError('Please enter your email'); return; }
      if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
      if (!mobile || mobile.length < 10) { setError('Please enter a valid mobile number'); return; }
      if (!age) { setError('Please enter your age'); return; }
      if (!gender) { setError('Please select your gender'); return; }
      if (!city) { setError('Please enter your city'); return; }
      if (!state) { setError('Please enter your state'); return; }
      if (!country) { setError('Please enter your country'); return; }
    }

    setLoading(true);
    setFinishingAnimation(false);

    try {
      // Minimum loading time to show off the cool animation
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!isLogin) {
        // ==================== SIGNUP FLOW ====================
        const { user: authUser, session, error: authError } = await authService.signUp(email, password);
        
        if (authError) {
          throw new Error(authError.message || 'Failed to create account');
        }

        if (!authUser) {
          throw new Error('Account creation failed. Please try again.');
        }

        // Step 2: Create profile in database with the auto-generated UUID
        const userId = authUser.id; // This is the auto-generated UUID from Supabase Auth
        let activeSession = session;

        if (!activeSession?.access_token) {
          const signinResult = await authService.signIn(email, password);
          if (signinResult.error || !signinResult.session) {
            throw new Error('Unable to create user session. Please try logging in.');
          }
          activeSession = signinResult.session;
        }
        
        apiService.setAuthToken(activeSession.access_token);
        
        const profileData = {
          name,
          mobile,
          age: parseInt(age),
          gender,
          city,
          state,
          country
        };

        try {
          await apiService.createUserProfile(userId, profileData);
        } catch (createError) {
          console.log('Create failed, trying update...', createError);
          await apiService.updateUserProfile(userId, profileData);
        }
        
        // Wait for minimum animation time
        await minLoadTime;
        
        // Trigger finish animation
        setFinishingAnimation(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for drop animation

        // Step 3: Log the user in
        login({
          user_id: userId,
          ...profileData,
          email,
          token: activeSession.access_token
        });
        
        showSuccess('Account created successfully! Welcome to FitLife AI!');
        navigate('/');
        
      } else {
        // ==================== LOGIN FLOW ====================
        const { user: authUser, session, error: authError } = await authService.signIn(email, password);
          
          if (authError) {
            throw new Error(authError.message || 'Login failed');
          }

          if (!authUser) {
            throw new Error('Login failed. Please check your credentials.');
          }

          const userId = authUser.id;
          apiService.setAuthToken(session?.access_token);

          // Fetch user profile from database
          let userData;
          try {
            const profile = await apiService.getUserProfile(userId);
            userData = {
              user_id: userId,
              ...profile,
              email: authUser.email,
              token: session?.access_token
            };
          } catch (err) {
            // If profile doesn't exist, just log them in with basic info
            userData = {
              user_id: userId,
              name: authUser.user_metadata?.name || 'User',
              email: authUser.email,
              token: session?.access_token
            };
          }
        
        // Wait for minimum animation time
        await minLoadTime;

        // Trigger finish animation
        setFinishingAnimation(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for drop animation

        login(userData);
        showSuccess('Welcome back!');
        navigate('/');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
      setLoading(false); // Stop loading immediately on error
    } finally {
      // Only stop loading if we didn't navigate (handled in try block)
      // If we navigated, component unmounts anyway
      if (error) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-container">
      {loading && <AuthLoading isFinishing={finishingAnimation} />}
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

              {/* Email Field */}
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

              {/* Phone Field - Only for Signup */}
              {!isLogin && (
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

              {/* Password Field - Show for both Login and Signup */}
              <div className="form-group">
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  placeholder={isLogin ? "Enter your password" : "Min 6 characters"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Confirm Password - Only for Signup */}
              {!isLogin && (
                <div className="form-group">
                  <label className="label" htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="input"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    setPassword('');
                    setConfirmPassword('');
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
