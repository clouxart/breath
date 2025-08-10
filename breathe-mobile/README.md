# Breathe Mobile App

A React Native/Expo version of the Breathe meditation app with breathing exercises and animations.

## Features

- Multiple breathing patterns (Box Breathing, 4-7-8, Wim Hof, Calm, Custom)
- Smooth animated breathing orb with React Native Reanimated
- Haptic feedback for phase transitions
- Sound support (phase indicators and ambient sounds)
- Session tracking and lifetime breath counter
- Dark mode optimized UI
- Persistent settings with AsyncStorage

## Setup

1. Install dependencies:

```bash
cd breathe-mobile
npm install
```

2. Start the development server:

```bash
npm start
```

## Running the App

### iOS Simulator

```bash
npm run ios
```

### Android Emulator

```bash
npm run android
```

### Physical Device

1. Install Expo Go app on your device
2. Scan the QR code from the terminal

## Project Structure

```
breathe-mobile/
├── App.tsx                 # Main app component
├── components/
│   ├── BreathingOrb.tsx   # Animated breathing visualization
│   └── SettingsPanel.tsx  # Settings modal
├── hooks/
│   ├── useSound.ts        # Audio and haptics management
│   └── useLocalStorage.ts # Persistent storage hook
├── types.ts               # TypeScript type definitions
└── assets/                # Images and icons
```

## Key Technologies

- React Native with TypeScript
- Expo SDK 52
- React Native Reanimated for animations
- Expo AV for audio playback
- Expo Haptics for tactile feedback
- AsyncStorage for data persistence
- React Native Safe Area Context

## Differences from Web Version

- Uses React Native components instead of HTML/CSS
- Animations use React Native Reanimated instead of Framer Motion
- Storage uses AsyncStorage instead of localStorage
- Haptic feedback for mobile experience
- Optimized for mobile performance
- Native modal for settings

## TODO

- [ ] Add actual sound files to assets
- [ ] Implement audio playback for phase sounds and ambient sounds
- [ ] Add app icons and splash screen
- [ ] Test on various device sizes
- [ ] Add push notifications for meditation reminders
- [ ] Implement background audio playback
