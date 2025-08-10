# Breathe Mobile - Development Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- For iOS: macOS with Xcode installed
- For Android: Android Studio with emulator

### Initial Setup

```bash
# Run the setup script
./setup.sh

# Or manually:
npm install
npx expo-doctor
```

## 📱 Running the App

### Using Expo Go (Recommended for Development)

```bash
npm start
# Scan QR code with Expo Go app on your device
```

### iOS Simulator

```bash
npm run ios
```

### Android Emulator

```bash
npm run android
```

### Web Browser

```bash
npm run web
```

## 🛠 Development Commands

| Command            | Description                      |
| ------------------ | -------------------------------- |
| `npm start`        | Start Expo development server    |
| `npm run ios`      | Run on iOS simulator             |
| `npm run android`  | Run on Android emulator          |
| `npm run web`      | Run in web browser               |
| `npm run clean`    | Clean and reinstall dependencies |
| `npm run doctor`   | Check project health             |
| `npm run lint`     | Check TypeScript errors          |
| `npm run prebuild` | Generate native projects         |

## 📂 Project Structure

```
breathe-mobile/
├── App.tsx                    # Main app component
├── components/
│   ├── BreathingOrb.tsx      # Animated breathing visualization
│   └── SettingsPanel.tsx     # Settings modal component
├── hooks/
│   ├── useSound.ts           # Audio and haptics management
│   └── useLocalStorage.ts    # Persistent storage hook
├── types.ts                  # TypeScript type definitions
├── assets/                   # Images, icons, and sounds
└── app.json                  # Expo configuration
```

## 🎨 Key Technologies

- **React Native**: Mobile app framework
- **Expo SDK 53**: Development platform
- **TypeScript**: Type-safe development
- **React Native Reanimated**: High-performance animations
- **Expo AV**: Audio playback
- **Expo Haptics**: Tactile feedback
- **AsyncStorage**: Data persistence

## 🔧 Configuration

### App Configuration (`app.json`)

- App name, version, and identifiers
- iOS and Android specific settings
- Splash screen and icon configuration
- Build settings

### Environment Variables

Create a `.env` file for environment-specific settings:

```bash
EXPO_PUBLIC_API_URL=your_api_url
```

## 🎭 Features

### Breathing Patterns

- Box Breathing (4-4-4-4)
- 4-7-8 Breathing
- Wim Hof Method
- Calm Pattern
- Custom Pattern

### Animations

All animations use React Native Reanimated for 60fps performance:

- Breathing orb scaling
- Smooth transitions
- Haptic feedback timing

### Sound System

- Phase indicator sounds (bell, chime, gong)
- Ambient sounds (ocean, forest, rain)
- Volume controls
- Background audio support

### Data Persistence

- Selected breathing pattern
- Custom durations
- Sound settings
- Total breath count

## 🐛 Debugging

### React Native Debugger

1. Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
2. Select "Debug JS Remotely"

### Console Logs

```bash
# View logs in terminal
npm start
```

### Performance Monitor

1. Open developer menu
2. Select "Show Perf Monitor"

## 📦 Building for Production

### iOS Build

```bash
# Configure EAS
eas build:configure

# Build for iOS
npm run build:ios
```

### Android Build

```bash
# Build for Android
npm run build:android
```

### Both Platforms

```bash
npm run build:all
```

## 🧪 Testing

### Type Checking

```bash
npm run lint
```

### Health Check

```bash
npm run doctor
```

## 🚨 Common Issues

### iOS Simulator Not Starting

```bash
# Reset simulator
xcrun simctl shutdown all
xcrun simctl erase all
```

### Android Emulator Issues

```bash
# Start emulator manually
emulator -avd <device_name>
```

### Dependency Issues

```bash
# Clean install
npm run clean
```

### Metro Bundler Issues

```bash
# Clear cache
npx expo start --clear
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated)
- [Expo AV Documentation](https://docs.expo.dev/versions/latest/sdk/av)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` to check for errors
4. Test on both iOS and Android
5. Submit a pull request

## 📄 License

MIT - See LICENSE file for details
