import { create } from "zustand";
import { Product } from "../types";
import {
  subscribeProducts,
  addProductDoc,
  updateProductDoc,
  deleteProductDoc,
} from "../services/firebase/products";
import { getExpiryStatus } from "../services/expiryService";

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  /** uid aktualnie zsynchronizowanego użytkownika (null = brak sesji) */
  currentUid: string | null;
  /** Start nasłuchu produktów danego użytkownika z Firestore. */
  startSync: (uid: string) => void;
  /** Zatrzymanie nasłuchu i wyczyszczenie produktów (np. po wylogowaniu). */
  stopSync: () => void;
  addProduct: (product: Omit<Product, "id" | "addedAt">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  getExpiringSoon: () => Product[];
  getExpiredProducts: () => Product[];
  getSortedByExpiry: () => Product[];
  getProductById: (id: string) => Product | undefined;
}

// Subskrypcja Firestore trzymana poza stanem (nie chcemy jej serializować/renderować).
let unsubscribe: (() => void) | null = null;

export const useProductStore = create<ProductStore>()((set, get) => ({
  products: [],
  isLoading: false,
  currentUid: null,

  startSync: (uid) => {
    if (get().currentUid === uid && unsubscribe) return;
    unsubscribe?.();
    set({ currentUid: uid, isLoading: true, products: [] });
    unsubscribe = subscribeProducts(uid, (products) => {
      set({ products, isLoading: false });
    });
  },

  stopSync: () => {
    unsubscribe?.();
    unsubscribe = null;
    set({ products: [], currentUid: null, isLoading: false });
  },

  addProduct: (product) => {
    const uid = get().currentUid;
    if (!uid) return;
    // Stan zaktualizuje subskrypcja onSnapshot po zapisie.
    addProductDoc(uid, {
      ...product,
      addedAt: new Date().toISOString(),
    }).catch(() => {});
  },

  updateProduct: (id, updates) => {
    const uid = get().currentUid;
    if (!uid) return;
    updateProductDoc(uid, id, updates).catch(() => {});
  },

  removeProduct: (id) => {
    const uid = get().currentUid;
    if (!uid) return;
    deleteProductDoc(uid, id).catch(() => {});
  },

  getExpiringSoon: () => {
    // "Wygasające wkrótce" = produkty z terminem < 2 tygodnie (status krytyczny
    // lub ostrzegawczy). Próg trzymany jest w expiryService (EXPIRING_SOON_DAYS).
    return get()
      .products.filter((p) => {
        const status = getExpiryStatus(p.expiryDate);
        return status === "critical" || status === "warning";
      })
      .sort(
        (a, b) =>
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
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
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
      );
  },

  getSortedByExpiry: () => {
    return [...get().products].sort(
      (a, b) =>
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
    );
  },

  getProductById: (id) => {
    return get().products.find((p) => p.id === id);
  },
}));
