/**
 * API Service - Handles all API calls to fitlife-ai-api backend
 */

const API_BASE_URL = 'https://fitlife-ai-api.vercel.app/api';

class ApiService {
  /**
   * Generic request handler
   */
  async request(endpoint, options = {}) {
    try {
      const config = {
        ...options,
        headers: {
          ...options.headers,
        },
      };

      // Only add Content-Type for requests with body (POST, PUT, PATCH)
      // This prevents CORS preflight on GET requests
      if (options.body) {
        config.headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ==================== HEALTH API ====================
  
  async createHealthRecord(userId, type, value, date) {
    // Check if first argument is an array for bulk creation
    if (Array.isArray(userId)) {
      return this.request('/health?action=create', {
        method: 'POST',
        body: JSON.stringify(userId),
      });
    }
    return this.request('/health?action=create', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, type, value, date }),
    });
  }

  async updateHealthRecord(id, type, value, date) {
    return this.request('/health?action=update', {
      method: 'PUT',
      body: JSON.stringify({ id, type, value, date }),
    });
  }

  async deleteHealthRecord(id) {
    return this.request(`/health?action=delete&id=${id}`, {
      method: 'DELETE',
    });
  }

  async getHealthRecords(userId, type) {
    const typeParam = type ? `&type=${type}` : '';
    return this.request(`/health?action=records&user_id=${userId}${typeParam}`);
  }

  async getHealthStats(userId, period = '7days') {
    return this.request(`/health?action=stats&user_id=${userId}&period=${period}`);
  }

  // ==================== FITNESS API ====================
  
  async createFitnessRoutine(userId, name, exercises) {
    return this.request('/fitness?action=create', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, name, exercises }),
    });
  }

  async getFitnessRoutines(userId) {
    return this.request(`/fitness?action=list&user_id=${userId}`);
  }

  async updateFitnessRoutine(id, name, exercises) {
    return this.request('/fitness?action=update', {
      method: 'PUT',
      body: JSON.stringify({ id, name, exercises }),
    });
  }

  // ==================== GOALS API ====================
  
  async setGoal(userId, type, target) {
    return this.request('/goals?action=set', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, type, target }),
    });
  }

  async getGoals(userId) {
    return this.request(`/goals?action=list&user_id=${userId}`);
  }

  async updateGoal(id, target) {
    return this.request('/goals?action=update', {
      method: 'PUT',
      body: JSON.stringify({ id, target }),
    });
  }

  // ==================== CALENDAR API ====================
  
  async createCalendarEvent(userId, title, type, date) {
    return this.request('/calendar?action=create', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, title, type, date }),
    });
  }

  async getCalendarEvents(userId, date) {
    return this.request(`/calendar?action=list&user_id=${userId}&date=${date}`);
  }

  async updateCalendarEvent(id, completed) {
    return this.request('/calendar?action=update', {
      method: 'PUT',
      body: JSON.stringify({ id, completed }),
    });
  }

  // ==================== USERS API ====================
  
  async createUserProfile(userId, profileData) {
    return this.request('/users?action=create', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, ...profileData }),
    });
  }

  async getUserProfile(userId) {
    return this.request(`/users?action=profile&user_id=${userId}`);
  }

  async updateUserProfile(userId, profileData) {
    return this.request('/users?action=profile', {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId, ...profileData }),
    });
  }

  // ==================== TELEGRAM API ====================
  
  async connectTelegram(userId, chatId) {
    return this.request('/telegram?action=connect', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, chat_id: chatId }),
    });
  }

  async sendTelegramReminder(userId, message) {
    return this.request('/telegram?action=send', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, message }),
    });
  }

  async setReminderTime(userId, reminderTime) {
    return this.request('/telegram?action=reminder-time', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, reminder_time: reminderTime }),
    });
  }

  // ==================== AI API ====================
  
  async analyzeFoodImage(imageBase64) {
    return this.request('/ai?action=analyze', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64 }),
    });
  }

  async getNutritionByBarcode(barcode) {
    return this.request(`/ai?action=nutrition&barcode=${barcode}`);
  }

  async analyzeHealth(metrics) {
    return this.request('/ai?action=analyze-health', {
      method: 'POST',
      body: JSON.stringify(metrics),
    });
  }
}

export default new ApiService();
