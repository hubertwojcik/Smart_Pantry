import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MMKVStorage, STORAGE_KEYS } from "../storage";
import { Product } from "../types";

interface ProductStore {
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "addedAt">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  getExpiringSoon: () => Product[];
  getExpiredProducts: () => Product[];
  getSortedByExpiry: () => Product[];
  getProductById: (id: string) => Product | undefined;
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) => {
        const newProduct: Product = {
          ...product,
          id: generateId(),
          addedAt: new Date().toISOString(),
        };
        set((state) => ({
          products: [...state.products, newProduct],
        }));
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      removeProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      getExpiringSoon: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

        return get()
          .products.filter((p) => {
            const expiry = new Date(p.expiryDate);
            expiry.setHours(0, 0, 0, 0);
            return expiry >= today && expiry <= sevenDaysLater;
          })
          .sort(
            (a, b) =>
              new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
          );
      },

      getExpiredProducts: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return get()
          .products.filter((p) => {
            const expiry = new Date(p.expiryDate);
            expiry.setHours(0, 0, 0, 0);
            return expiry < today;
          })
          .sort(
            (a, b) =>
              new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
          );
      },

      getSortedByExpiry: () => {
        return [...get().products].sort(
          (a, b) =>
            new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        );
      },

      getProductById: (id) => {
        return get().products.find((p) => p.id === id);
      },
    }),
    {
      name: STORAGE_KEYS.PRODUCTS,
      storage: createJSONStorage(() => MMKVStorage),
    }
  )
);
