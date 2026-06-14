import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import * as SecureStore from "expo-secure-store";
import { firebaseConfig } from "../../config";

/**
 * Adapter trzymający stan sesji Firebase Auth (w tym token) w expo-secure-store.
 *
 * Firebase zapisuje tu swój wpis sesji, a `getReactNativePersistence` automatycznie
 * odczytuje go przy starcie aplikacji i odtwarza zalogowanego użytkownika
 * (onAuthStateChanged). Dzięki temu token żyje w bezpiecznym, szyfrowanym
 * keychain/keystore, a nie w zwykłym AsyncStorage.
 *
 * SecureStore dopuszcza w kluczach tylko [A-Za-z0-9._-], a klucze Firebase
 * zawierają ":" — dlatego je sanityzujemy.
 */
const sanitizeKey = (key: string) => key.replace(/[^a-zA-Z0-9._-]/g, "_");

const secureStorePersistenceAdapter = {
  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(sanitizeKey(key), value),
  getItem: (key: string) => SecureStore.getItemAsync(sanitizeKey(key)),
  removeItem: (key: string) => SecureStore.deleteItemAsync(sanitizeKey(key)),
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth musi zostać wywołane dokładnie raz. Przy Fast Refresh moduł może
// się przeładować, gdy Auth jest już zainicjalizowany — wtedy używamy getAuth().
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(secureStorePersistenceAdapter),
  });
} catch {
  auth = getAuth(app);
}

export const firebaseAuth = auth;
export const db = getFirestore(app);
export { app as firebaseApp };
