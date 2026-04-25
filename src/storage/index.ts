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
    storage.delete(name);
  },
};

export const STORAGE_KEYS = {
  PRODUCTS: "pantry-products",
  NOTIFICATIONS: "pantry-notifications",
  SENT_NOTIFICATIONS: "sent-notifications",
} as const;
