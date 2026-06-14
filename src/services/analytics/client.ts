import { storage } from "../../storage";

const CLIENT_ID_KEY = "analytics-client-id";

/**
 * Stały, anonimowy identyfikator urządzenia/instalacji.
 * Wymagany przez GA4 Measurement Protocol (client_id) i przydatny do grupowania
 * zdarzeń w Firestore. Generowany raz i zapisywany w MMKV.
 */
export const getClientId = (): string => {
  let id = storage.getString(CLIENT_ID_KEY);
  if (!id) {
    id = `${Date.now()}.${Math.floor(Math.random() * 1_000_000_000)}`;
    storage.set(CLIENT_ID_KEY, id);
  }
  return id;
};

/** Identyfikator bieżącej sesji aplikacji (od uruchomienia procesu). */
export const SESSION_ID = `${Date.now()}`;
