import { StateStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV({
  id: "pantry-storage",
  encryptionKey: "pantry-secret-key",
});

export const MMKVStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

export const STORAGE_KEYS = {
  PRODUCTS: "pantry-products",
  NOTIFICATIONS: "pantry-notifications",
  SENT_NOTIFICATIONS: "sent-notifications",
} as const;

/**
 * Usuwa osierocone dane ze starej (lokalnej, współdzielonej między kontami)
 * wersji aplikacji. Produkty żyją teraz w Firestore (per-użytkownik), a alerty
 * tylko w pamięci — te klucze MMKV nie są już używane.
 * Wywoływane raz przy starcie aplikacji.
 */
export const clearLegacyStorage = () => {
  storage.remove(STORAGE_KEYS.PRODUCTS);
  storage.remove(STORAGE_KEYS.NOTIFICATIONS);
  storage.remove("pantry-auth"); // stare, fałszywe logowanie sprzed Firebase
};
