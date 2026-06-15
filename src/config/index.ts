/**
 * ====================================================================
 *  KONFIGURACJA USŁUG ZEWNĘTRZNYCH  (Firebase + Google Analytics)
 * ====================================================================
 *
 * Wartości czytane są ze zmiennych środowiskowych (`.env`, prefiks
 * EXPO_PUBLIC_). Skopiuj `.env.example` do `.env` i uzupełnij:
 *
 *     cp .env.example .env
 *
 * Plik `.env` jest w `.gitignore` i NIE trafia do repozytorium.
 *
 * Uwaga: firebaseConfig to publiczne klucze klienta (nie są tajne).
 * Bezpieczeństwo danych zapewniają Firestore Security Rules, nie
 * ukrywanie tych wartości.
 */

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const ga4Config = {
  measurementId: process.env.EXPO_PUBLIC_GA4_MEASUREMENT_ID ?? "",
  apiSecret: process.env.EXPO_PUBLIC_GA4_API_SECRET ?? "",
};

/** Nazwa kolekcji w Firestore, do której trafiają zdarzenia użytkownika. */
export const BEHAVIOR_EVENTS_COLLECTION = "analytics_events";

/** Czy konfiguracja Firebase została uzupełniona. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);

/** Czy konfiguracja GA4 została uzupełniona. */
export const isGa4Configured = Boolean(
  ga4Config.apiSecret && ga4Config.measurementId,
);
