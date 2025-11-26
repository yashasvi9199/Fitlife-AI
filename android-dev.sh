#!/bin/bash

# Android Development Helper Script for FitLife AI
# This script sets up the Android environment and provides easy commands

# Set Android environment variables
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$HOME/Android/Sdk
export JAVA_HOME=/opt/android-studio/jbr
export PATH=$PATH:$JAVA_HOME/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export CAPACITOR_ANDROID_STUDIO_PATH=/opt/android-studio/bin/studio.sh

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 FitLife AI - Android Development Helper${NC}"
echo ""

# Check what command was passed
case "$1" in
  open)
    echo -e "${GREEN}📱 Opening Android Studio...${NC}"
    npx cap open android
    ;;
  
  sync)
    echo -e "${GREEN}🔄 Building React app and syncing to Android...${NC}"
    CAPACITOR=true npm run build && npx cap sync android
    ;;
  
  run)
    echo -e "${GREEN}🚀 Building and running on device/emulator...${NC}"
    CAPACITOR=true npm run build && npx cap sync android && npx cap run android
    ;;
  
  build-debug)
    echo -e "${GREEN}🔨 Building debug APK...${NC}"
    CAPACITOR=true npm run build && npx cap sync android
    cd android && ./gradlew assembleDebug
    echo -e "${GREEN}✅ Debug APK created at: android/app/build/outputs/apk/debug/app-debug.apk${NC}"
    ;;
  
  build-release)
    echo -e "${GREEN}🔨 Building release APK...${NC}"
    CAPACITOR=true npm run build && npx cap sync android
    cd android && ./gradlew assembleRelease
    echo -e "${GREEN}✅ Release APK created at: android/app/build/outputs/apk/release/app-release.apk${NC}"
    ;;
  
  clean)
    echo -e "${GREEN}🧹 Cleaning Android build...${NC}"
    cd android && ./gradlew clean
    ;;
  
  devices)
    echo -e "${GREEN}📱 Connected devices:${NC}"
    adb devices
    ;;
  
  logcat)
    echo -e "${GREEN}📋 Showing Android logs (Ctrl+C to exit)...${NC}"
    adb logcat | grep -i "chromium\|console\|capacitor"
    ;;
  
  *)
    echo "Usage: ./android-dev.sh [command]"
    echo ""
    echo "Available commands:"
    echo "  open          - Open project in Android Studio"
    echo "  sync          - Build React app and sync to Android"
    echo "  run           - Build, sync, and run on device/emulator"
    echo "  build-debug   - Build debug APK"
    echo "  build-release - Build release APK"
    echo "  clean         - Clean Android build"
    echo "  devices       - List connected devices"
    echo "  logcat        - Show Android logs"
    echo ""
    echo "Example: ./android-dev.sh open"
    ;;
esac
