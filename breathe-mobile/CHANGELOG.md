# Breathe Mobile - Changelog

## Version 1.1.0 - Enhanced Visual Design

### 🎨 Visual Enhancements

- **Deep Gradient Background**: Multi-layer gradient with 5 color stops for depth
- **Animated Gradient Blobs**: Rotating gradient orbs with proper blur effects
- **Glassmorphism Effects**: Added blur and transparency layers to UI elements
- **Improved Breathing Orb**:
  - Linear gradient overlay on the orb
  - Blur effects for glass-like appearance
  - Better opacity transitions (0.25 to 0.45)
  - Nested gradient layers for depth

### 🔘 Button Improvements

- **Start Button**: Enhanced gradient with blur overlay
- **Stop Button**: Better shadow and border styling
- **Settings Button**: Blur effect with active state indicator

### 📊 UI Refinements

- **Stats Cards**: Reduced opacity for subtle appearance
- **Pattern Selector**: Adjusted text colors for better hierarchy
- **Typography**: Fine-tuned font weights and colors
- **Shadows**: Added subtle shadows for depth

### 🎯 Color Adjustments

- Background: Deep navy to black gradient (#0a0a0f to #1a1a3e)
- Primary Blue: rgba(59, 130, 246, x)
- Secondary Purple: rgba(147, 51, 234, x)
- Text: Multiple opacity levels for hierarchy

### 📦 New Dependencies

- `expo-blur`: For glassmorphism effects
- `@react-native-community/slider`: For settings sliders

### 🐛 Bug Fixes

- Fixed TypeScript type errors
- Resolved slider component import issues
- Fixed sound config type mismatches

## Installation

```bash
npm install
npm start
```

## Features Matching Web Version

- ✅ Gradient background with animated blobs
- ✅ Glassmorphism breathing orb
- ✅ Gradient button styles
- ✅ Footer attribution
- ✅ Settings panel with blur effects
- ✅ Haptic feedback
- ✅ Persistent storage
