/**
 * CacheService
 * Handles secure local storage of application data to reduce API calls.
 * Uses obfuscation to prevent easy reading of data in dev tools.
 */

const CACHE_PREFIX = 'fitlife_secure_';
const SALT = 'fitlife_salt_v1_';

class CacheService {
  /**
   * Encrypt/Obfuscate data
   * Simple Base64 + Salt mechanism. Not military grade, but prevents casual inspection.
   */
  encrypt(data) {
    try {
      const jsonString = JSON.stringify(data);
      const salted = SALT + jsonString;
      // Use encodeURIComponent to handle Unicode characters before btoa
      const encoded = encodeURIComponent(salted);
      return btoa(encoded);
    } catch (e) {
      console.error('Encryption failed', e);
      return null;
    }
  }

  /**
   * Decrypt/De-obfuscate data
   */
  decrypt(encryptedData) {
    try {
      const decoded = atob(encryptedData);
      // Decode the URI component to restore Unicode characters
      const decodedUri = decodeURIComponent(decoded);
      if (!decodedUri.startsWith(SALT)) {
        return null; // Invalid or tampered data
      }
      const jsonString = decodedUri.slice(SALT.length);
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Decryption failed', e);
      return null;
    }
  }

  /**
   * Save data to cache
   * @param {string} key - Cache key
   * @param {any} data - Data to store
   */
  set(key, data) {
    const encrypted = this.encrypt(data);
    if (encrypted) {
      localStorage.setItem(CACHE_PREFIX + key, encrypted);
    }
  }

  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @returns {any|null} - Decrypted data or null if not found/invalid
   */
  get(key) {
    const encrypted = localStorage.getItem(CACHE_PREFIX + key);
    if (!encrypted) return null;
    return this.decrypt(encrypted);
  }

  /**
   * Remove specific item from cache
   */
  remove(key) {
    localStorage.removeItem(CACHE_PREFIX + key);
  }

  /**
   * Clear all app-related cache
   */
  clear() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const cacheService = new CacheService();
