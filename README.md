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

> ⚠️ Przed uruchomieniem uzupełnij konfigurację Firebase i Google Analytics w
> `src/config/index.ts` (instrukcja krok po kroku poniżej w sekcji
> [Logowanie i Analityka](#logowanie-i-analityka-firebase--google-analytics)).

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

### Konfiguracja Firebase (logowanie + analiza zachowań)

1. Wejdź na [Firebase Console](https://console.firebase.google.com) i utwórz projekt.
2. **Project settings → Your apps → Web (`</>`)** → zarejestruj aplikację i skopiuj obiekt `firebaseConfig`.
3. Wklej wartości do `firebaseConfig` w `src/config/index.ts`.
4. **Authentication → Sign-in method → Email/Password → Enable.**
5. **Firestore Database → Create database.** Na potrzeby projektu reguły mogą zezwalać zalogowanym na zapis do `analytics_events`, np.:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /analytics_events/{doc} {
         allow create: if request.auth != null;
         allow read: if false; // odczyt tylko z konsoli Firebase
       }
     }
   }
   ```

### Konfiguracja Google Analytics (GA4)

1. Wejdź na [Google Analytics](https://analytics.google.com) → **Admin → Create Property**.
2. Dodaj **strumień danych typu Web** (Measurement Protocol działa ze strumieniem Web).
3. Skopiuj **Measurement ID** (`G-XXXXXXXXXX`) do `ga4Config.measurementId`.
4. W strumieniu: **Measurement Protocol API secrets → Create** → skopiuj `Secret value` do `ga4Config.apiSecret`.
5. Zdarzenia zobaczysz w **Realtime** oraz **Admin → DebugView** (Events).

### Co jest śledzone

- `screen_view` — automatycznie przy każdej zmianie ekranu (listener w `NavigationContainer`).
- `login`, `register`, `logout`, `tap_login`, `tap_register` — przepływ uwierzytelniania.
- `add_product` (z `category`, `from_scan`), `scan_barcode` — kluczowe akcje w aplikacji.

Każde zdarzenie trafia jednocześnie do **GA4** i do **Firestore**.

### Screeny (do raportu)

> Wstaw zrzuty ekranu po skonfigurowaniu usług i wygenerowaniu ruchu w aplikacji.

**Aplikacja:**

<!-- ![Ekran logowania](docs/screens/login.png) -->
<!-- ![Dashboard / Spiżarnia](docs/screens/pantry.png) -->
<!-- ![Dodawanie produktu](docs/screens/add-product.png) -->

**Google Analytics (GA4):**

<!-- ![GA4 Realtime](docs/screens/ga4-realtime.png) -->
<!-- ![GA4 Events / DebugView](docs/screens/ga4-events.png) -->

**Analiza zachowań (Firestore — odpowiednik Hotjar):**

<!-- ![Firestore analytics_events](docs/screens/firestore-events.png) -->

## Design

The app follows a premium, editorial design aesthetic with:

- Warm color palette (Fresh Orange #F97316 as primary)
- Manrope font family
- Generous whitespace and soft shadows
- No harsh borders - uses tonal layering
- Smooth animations throughout

## License

MIT
