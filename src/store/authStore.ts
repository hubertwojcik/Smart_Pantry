import { create } from "zustand";
import {
  subscribeToAuthChanges,
  signIn,
  signUp,
  signOutUser,
  getAuthErrorMessage,
  type AuthUser,
} from "../services/firebase/auth";
import { useProductStore } from "./productStore";
import { useNotificationStore } from "./notificationStore";

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** true dopóki sprawdzamy sesję z expo-secure-store przy starcie aplikacji */
  isInitializing: boolean;
  /** true w trakcie logowania/rejestracji (do spinnera na przyciskach) */
  isSubmitting: boolean;
  /** Subskrybuje stan Firebase Auth. Zwraca funkcję do odsubskrybowania. */
  initialize: () => () => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  isSubmitting: false,

  initialize: () =>
    subscribeToAuthChanges((user) => {
      set({
        user,
        isAuthenticated: !!user,
        isInitializing: false,
      });

      if (user) {
        // Załaduj dane TEGO użytkownika z Firestore.
        useProductStore.getState().startSync(user.uid);
        useNotificationStore.getState().startSync(user.uid);
      } else {
        // Wylogowanie: odłącz nasłuch i wyczyść stan lokalny.
        // (Dane w Firestore zostają — alerty mają być zapamiętane.)
        useProductStore.getState().stopSync();
        useNotificationStore.getState().stopSync();
      }
    }),

  login: async (email, password) => {
    set({ isSubmitting: true });
    try {
      await signIn(email, password);
      // Stan użytkownika ustawi subskrypcja onAuthStateChanged.
      return { success: true };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  register: async (name, email, password) => {
    set({ isSubmitting: true });
    try {
      await signUp(name, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  logout: async () => {
    await signOutUser();
  },
}));
