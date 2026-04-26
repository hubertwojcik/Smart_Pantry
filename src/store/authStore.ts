import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MMKVStorage } from "../storage";

interface User {
  name: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  password: string | null;
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      password: null,
      isAuthenticated: false,

      register: (name, email, password) => {
        set({ user: { name, email }, password, isAuthenticated: true });
      },

      login: (email, password) => {
        const { user, password: storedPassword } = get();
        if (user?.email === email && storedPassword === password) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false });
      },
    }),
    {
      name: "pantry-auth",
      storage: createJSONStorage(() => MMKVStorage),
    }
  )
);
