/**
 * ====================================================================
 *  KONFIGURACJA USŁUG ZEWNĘTRZNYCH  (Firebase + Google Analytics)
 * ====================================================================
 *
 * Uzupełnij poniższe wartości danymi ze swoich projektów.
 * Wartości te NIE są tajne (firebaseConfig to klucze publiczne klienta),
 * z wyjątkiem GA4 `apiSecret` — traktuj go jak hasło.
 *
 * --- FIREBASE ---
 * 1. https://console.firebase.google.com  ->  utwórz projekt
 * 2. Project settings -> "Your apps" -> dodaj aplikację Web (</>)
 * 3. Skopiuj obiekt `firebaseConfig` i wklej poniżej.
 * 4. Authentication -> Sign-in method -> włącz "Email/Password".
 * 5. Firestore Database -> Create database (tryb produkcyjny lub testowy).
 *
 * --- GOOGLE ANALYTICS (GA4) ---
 * 1. https://analytics.google.com -> Admin -> Create Property
 * 2. Dodaj strumień danych typu "Web" (działa też dla Measurement Protocol).
 * 3. measurementId = "G-XXXXXXXXXX" (Data Streams -> twój strumień).
 * 4. apiSecret: Data Streams -> twój strumień -> "Measurement Protocol API secrets"
 *    -> "Create" -> skopiuj wartość "Secret value".
 */

export const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "smart-pantry-21f6a.firebaseapp.com",
  projectId: "smart-pantry-21f6a",
  storageBucket: "smart-pantry-21f6a.firebasestorage.app",
  messagingSenderId: "629096359017",
  appId: "***REMOVED***",
};

export const ga4Config = {
  measurementId: "G-SNTKNVM6SY",
  // GA4 → Admin → Data Streams → (Twój strumień) →
  // "Measurement Protocol API secrets" → Create → wklej "Secret value".
  apiSecret: "TODO_GA4_API_SECRET",
};

/** Nazwa kolekcji w Firestore, do której trafiają zdarzenia użytkownika. */
export const BEHAVIOR_EVENTS_COLLECTION = "analytics_events";

/** Czy konfiguracja została uzupełniona (proste zabezpieczenie przed wysyłką do "TODO_"). */
export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith("TODO_");
export const isGa4Configured =
  !ga4Config.apiSecret.startsWith("TODO_") &&
  ga4Config.measurementId !== "G-XXXXXXXXXX";
