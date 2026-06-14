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
- **Auth**: Firebase Authentication (Email/Password), token w expo-secure-store
- **Analytics**: Firestore (analiza zachowań) + Google Analytics 4 (Measurement Protocol)
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

> ⚠️ **Aplikacja NIE działa w Expo Go.** Używa natywnych modułów
> (`expo-dev-client`, `react-native-mmkv`, `expo-camera`, `expo-notifications`),
> więc trzeba zbudować i uruchomić **własnego dev clienta** przez
> `npm run ios` / `npm run android`. To wymaga skonfigurowanego środowiska
> React Native (Xcode / Android Studio).

### Prerequisites

- **Node.js 18+**
- **Środowisko React Native** (natywny build):
  - **iOS** – macOS + Xcode + CocoaPods
  - **Android** – Android Studio + Android SDK + skonfigurowany emulator/urządzenie
  - Pełna instrukcja krok po kroku:
    https://reactnative.dev/docs/set-up-your-environment
    (na górze wybierz **Development OS** oraz **Target OS: Android/iOS**)
- iOS Simulator lub Android Emulator (albo fizyczne urządzenie w trybie deweloperskim)

### Installation

```bash
# 1. Zainstaluj zależności
npm install
```


### Running the app (dev client)

Pierwsze uruchomienie kompiluje natywną aplikację (może chwilę potrwać):

```bash
# iOS (wymaga macOS + Xcode)
npm run ios

# Android (wymaga Android Studio + SDK)
npm run android
```

Powyższe komendy budują dev clienta, instalują go na symulatorze/urządzeniu
i startują bundler Metro. Przy kolejnych uruchomieniach (bez zmian natywnych)
wystarczy sam bundler:

```bash
# Start Metro; aplikację otwórz na urządzeniu/symulatorze (klawisz i / a)
npx expo start --dev-client
```

> 💡 Po zmianie `metro.config.js` lub konfiguracji uruchom z czyszczeniem cache:
> `npx expo start -c`.

Przydatne linki:

- Konfiguracja środowiska RN: https://reactnative.dev/docs/set-up-your-environment
- Expo Dev Client: https://docs.expo.dev/develop/development-builds/introduction/
- Expo – uruchamianie na urządzeniu: https://docs.expo.dev/get-started/set-up-your-environment/

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

## Logowanie i Analityka (Firebase + Google Analytics)

Aplikacja realizuje trzy wymagania projektowe (mobilny odpowiednik checklisty webowej):

| Wymaganie z checklisty | Realizacja w aplikacji mobilnej |
| --- | --- |
| Logowanie (Firebase Authentication) | **Firebase Auth (Email/Password)** przez Firebase JS SDK. Token sesji trzymany w **`expo-secure-store`** (szyfrowany keychain/keystore) i automatycznie wczytywany przy starcie. |
| Narzędzie do analizy zachowań (Hotjar) | **Własny system logowania zdarzeń do Firestore** (kolekcja `analytics_events`) — odpowiednik Hotjar dla mobile: rejestruje kto, gdzie, co i kiedy zrobił. |
| Google Analytics | **GA4 przez Measurement Protocol** (HTTP) — webowy `firebase/analytics` nie działa w RN, więc zdarzenia (`screen_view`, akcje) wysyłamy bezpośrednio do GA4. |

### Architektura

```
src/config/index.ts            # konfiguracja Firebase + GA4 (DO UZUPEŁNIENIA)
src/services/firebase/
├── index.ts                   # init app + Auth (persistence w expo-secure-store) + Firestore
└── auth.ts                    # login / register / logout / subskrypcja sesji + błędy PL
src/services/analytics/
├── client.ts                  # stały clientId + sessionId
├── ga4.ts                     # wysyłka do GA4 (Measurement Protocol)
├── behavior.ts                # logowanie zdarzeń do Firestore
└── index.ts                   # wspólny punkt wejścia: analytics.screenView() / analytics.track()
src/store/authStore.ts         # stan sesji (isAuthenticated) sterujący nawigacją
```

Sesja steruje nawigacją: `App.tsx` przy starcie odpala `authStore.initialize()` (pokazuje
splash dopóki nie wiadomo czy jest sesja), a `src/navigation/index.tsx` pokazuje ekrany
logowania albo aplikację w zależności od `isAuthenticated`.


**Aplikacja:**

<!-- ![Ekran logowania](docs/screens/login.png) -->
<!-- ![Dashboard / Spiżarnia](docs/screens/pantry.png) -->
<!-- ![Dodawanie produktu](docs/screens/add-product.png) -->

**Google Analytics (GA4):**

<!-- ![GA4 Realtime](docs/screens/ga4-realtime.png) -->
<!-- ![GA4 Events / DebugView](docs/screens/ga4-events.png) -->

**Analiza zachowań (Firestore — odpowiednik Hotjar):**

<!-- ![Firestore analytics_events](docs/screens/firestore-events.png) -->


