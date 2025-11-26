# 📱 FitLife AI - Android App

Native Android application built with Capacitor for the FitLife AI fitness tracking platform.

## 🚀 Quick Start

### Download & Install

1. **Download the APK**: Get the latest release from [GitHub Releases](https://github.com/yashasvi9199/Fitlife-AI/releases)
2. **Enable Unknown Sources**: Go to Settings → Security → Enable "Install from Unknown Sources"
3. **Install**: Open the downloaded APK file and follow the installation prompts
4. **Launch**: Find "FitLife AI" in your app drawer and start tracking your fitness!

## 📦 Latest Release

- **Version**: 1.0.0
- **File**: `FitLife-AI-v1.0.0.apk`
- **Size**: ~7.8 MB
- **Minimum Android**: 10 (API 29)
- **Target Android**: 14 (API 35)

## ✨ Features

- ✅ **Native Performance** - Smooth, fast, and responsive
- ✅ **Offline Support** - Works without internet connection
- ✅ **Status Bar Integration** - Proper safe area handling
- ✅ **Splash Screen** - Beautiful branded loading screen
- ✅ **Keyboard Management** - Smart keyboard handling
- ✅ **All Web Features** - Complete parity with web version

## 🔧 Development Setup

### Prerequisites

- Node.js 16+
- Java JDK 21
- Android Studio (optional, for advanced development)

### Build from Source

```bash
# Install dependencies
npm install

# Build web assets
npm run build

# Sync with Android
npx cap sync android

# Build release APK
cd android
./gradlew assembleRelease

# APK location
# android/app/build/outputs/apk/release/app-release.apk
```

### Development Commands

```bash
# Sync changes to Android
npm run android:sync

# Open in Android Studio
npm run android:open

# Build and run on device
npm run android:run

# Build release APK
npm run android:build
```

## 🔐 Security & Signing

The release APK is signed with a release keystore for security and authenticity. This ensures:

- ✅ App integrity verification
- ✅ Secure updates
- ✅ Protection against tampering
- ✅ Reduced Play Protect warnings

**Note**: The keystore file is excluded from version control for security.

## 📱 Capacitor Plugins

The app uses the following Capacitor plugins:

- **@capacitor/app** (7.1.0) - App lifecycle management
- **@capacitor/keyboard** (7.0.3) - Keyboard control
- **@capacitor/splash-screen** (7.0.3) - Splash screen
- **@capacitor/status-bar** (7.0.3) - Status bar styling

## 🎨 App Configuration

### App Details

- **App ID**: `com.fitlifeai.app`
- **App Name**: FitLife AI
- **Version Code**: 1
- **Version Name**: 1.0

### Status Bar

- **Style**: Dark content
- **Background**: `#4F46E5` (Indigo)

### Splash Screen

- **Duration**: 2000ms
- **Background**: `#4F46E5` (Indigo)
- **Spinner**: White

## 🐛 Troubleshooting

### Installation Issues

**"App not installed"**

- Ensure you have enough storage space
- Try uninstalling any previous version first
- Clear download cache and retry

**"Play Protect warning"**

- This is normal for apps outside Google Play Store
- The app is safe - it's signed with a release certificate
- Tap "Install anyway" to proceed

**"Unknown sources blocked"**

- Go to Settings → Security
- Enable "Install from Unknown Sources" or "Allow from this source"

### Runtime Issues

**App crashes on startup**

- Clear app data: Settings → Apps → FitLife AI → Clear Data
- Reinstall the app
- Check Android version (minimum Android 10 required)

**Features not working**

- Ensure you have an internet connection (for API calls)
- Check app permissions in Settings
- Try logging out and back in

## 📊 Performance

- **App Size**: ~7.8 MB
- **Startup Time**: < 2 seconds
- **Memory Usage**: ~50-80 MB
- **Battery Impact**: Minimal (no background services)

## 🔄 Updates

To update the app:

1. Download the latest APK from GitHub Releases
2. Install over the existing app (no need to uninstall)
3. Your data will be preserved

## 🤝 Contributing

To contribute to the Android app:

1. Fork the repository
2. Make your changes
3. Test on physical device
4. Submit a pull request

## 📄 License

MIT License - See main README for details

## 🔗 Links

- **Web App**: [https://yashasvi9199.github.io/Fitlife-AI](https://yashasvi9199.github.io/Fitlife-AI)
- **API**: [https://fitlife-ai-api.vercel.app](https://fitlife-ai-api.vercel.app)
- **GitHub**: [https://github.com/yashasvi9199/Fitlife-AI](https://github.com/yashasvi9199/Fitlife-AI)

---

**Built with ❤️ using Capacitor**
