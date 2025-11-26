/**
 * Auth Service - Handles authentication via Vercel API
 * All Supabase credentials are stored securely in Vercel environment variables
 */

const API_BASE_URL = 'https://fitlife-ai-api.vercel.app/api';

export const authService = {
  /**
   * Sign up a new user with email and password
   */
  async signUp(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth?action=signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { user: null, error };
    }
  },

  /**
   * Sign in an existing user with email and password
   */
  async signIn(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth?action=signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, session: null, error };
    }
  },
};

export default authService;

