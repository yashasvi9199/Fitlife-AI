/**
 * Capacitor Plugin Initialization
 * 
 * This file initializes Capacitor plugins for the Android app.
 * Import this file in your main App.jsx or index.jsx
 */

import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

/**
 * Initialize Capacitor plugins
 * Call this function when your app starts
 */
export const initializeCapacitor = async () => {
  try {
    console.log('🚀 Starting Capacitor initialization...');
    
    // Configure Status Bar
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#4F46E5' });
    await StatusBar.setOverlaysWebView({ overlay: false });
    console.log('✅ Status bar configured');

    // Configure keyboard behavior
    Keyboard.setAccessoryBarVisible({ isVisible: true });
    console.log('✅ Keyboard configured');

    // Add app state listeners
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?', isActive);
    });

    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });
    console.log('✅ App listeners configured');

    // Hide splash screen after a delay to ensure app is loaded
    setTimeout(async () => {
      try {
        await SplashScreen.hide();
        console.log('✅ Splash screen hidden');
      } catch (err) {
        console.error('Error hiding splash screen:', err);
      }
    }, 1000);

    console.log('✅ Capacitor plugins initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Capacitor plugins:', error);
  }
};

/**
 * Check if running on native platform
 */
export const isNativePlatform = () => {
  return window.Capacitor && window.Capacitor.isNativePlatform();
};

/**
 * Get app information
 */
export const getAppInfo = async () => {
  try {
    const info = await App.getInfo();
    return info;
  } catch (error) {
    console.error('Error getting app info:', error);
    return null;
  }
};
