# Inteligentna Spiżarnia (Smart Pantry)

A React Native Expo mobile app for managing your pantry inventory with expiry date tracking and notifications.

## Features

- **Product Management**: Add, edit, and remove products from your pantry
- **Barcode Scanning**: Scan product barcodes to auto-fill product information using Open Food Facts API
- **Expiry Tracking**: Visual indicators for product expiry status (OK, Warning, Critical, Expired)
- **Local Notifications**: Background task that checks expiry dates and sends notifications
- **Offline First**: All data stored locally using MMKV for fast, encrypted storage
- **Beautiful UI**: Modern design with Manrope font, smooth animations, and intuitive navigation

## Tech Stack

- **React Native + Expo** (SDK 54)
- **TypeScript** (strict mode)
- **Navigation**: React Navigation (bottom tabs + native stack)
- **State Management**: Zustand with MMKV persistence
- **Camera**: expo-camera for barcode scanning
- **Notifications**: expo-notifications (local)
- **Background Tasks**: expo-task-manager + expo-background-fetch
- **Fonts**: @expo-google-fonts/manrope
- **Icons**: @expo/vector-icons (Ionicons)

## Project Structure

```
src/
├── components/       # Shared UI components
│   ├── CategoryPicker.tsx
│   ├── EmptyState.tsx
│   ├── FilterChip.tsx
│   ├── FloatingInput.tsx
│   ├── NotificationCard.tsx
│   ├── ProductCard.tsx
│   ├── QuantityStepper.tsx
│   ├── RecipeSuggestionCard.tsx
│   ├── StatusBadge.tsx
│   └── UnitToggle.tsx
├── screens/          # Screen components
│   ├── PantryScreen.tsx
│   ├── AddProductScreen.tsx
│   ├── AlertsScreen.tsx
│   ├── ProductDetailScreen.tsx
│   └── BarcodeScannerScreen.tsx
├── store/            # Zustand stores
│   ├── productStore.ts
│   └── notificationStore.ts
├── storage/          # MMKV setup
│   └── index.ts
├── services/         # API calls, notifications, background tasks
│   ├── backgroundTask.ts
│   ├── expiryService.ts
│   ├── notificationService.ts
│   └── openFoodFacts.ts
├── navigation/       # React Navigation config
│   └── index.tsx
├── types/            # TypeScript interfaces
│   └── index.ts
└── constants/        # Theme tokens
    └── theme.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Installation

```
Setup env:
https://reactnative.dev/docs/set-up-your-environment
```

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Device

1. Install Expo Go on your iOS or Android device
2. Scan the QR code from the terminal
3. Or press `i` for iOS simulator / `a` for Android emulator

## Key Features Implementation

### Expiry Status Logic

- **Expired**: Past expiry date
- **Critical**: Today or tomorrow (≤1 day)
- **Warning**: 2-7 days until expiry
- **OK**: 8+ days until expiry

### Background Notifications

The app uses `expo-task-manager` and `expo-background-fetch` to periodically check product expiry dates and send local notifications:

- Runs every 8 hours in background
- Notifies for products expiring within 7 days
- Avoids duplicate notifications using MMKV tracking

### Barcode Scanning

Uses `expo-camera` with barcode scanning capabilities and fetches product data from the Open Food Facts API:

- Supports EAN-13, EAN-8, UPC-A, UPC-E, Code128, Code39, Code93
- Auto-fills product name, weight, category, and image

## Design

The app follows a premium, editorial design aesthetic with:

- Warm color palette (Fresh Orange #F97316 as primary)
- Manrope font family
- Generous whitespace and soft shadows
- No harsh borders - uses tonal layering
- Smooth animations throughout

## License

MIT
