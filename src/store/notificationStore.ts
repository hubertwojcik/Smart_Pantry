import { create } from "zustand";
import { Notification } from "../types";
import {
  subscribeNotifications,
  createNotificationDoc,
  markNotificationReadDoc,
  markAllNotificationsReadDocs,
  deleteNotificationDoc,
  deleteAllNotificationsDocs,
} from "../services/firebase/notifications";

type NewNotification = Omit<Notification, "id" | "read" | "createdAt">;

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  currentUid: string | null;
  /** Start nasłuchu powiadomień użytkownika z Firestore. */
  startSync: (uid: string) => void;
  /** Zatrzymanie nasłuchu i wyczyszczenie stanu lokalnego (NIE usuwa z Firestore). */
  stopSync: () => void;
  /** Tworzy powiadomienie o deterministycznym id (idempotentne — bez duplikatów). */
  addNotification: (id: string, data: NewNotification) => void;
  markAllRead: () => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  /** Trwałe usunięcie wszystkich powiadomień użytkownika z Firestore. */
  clearAll: () => void;
  getNotificationsGrouped: () => {
    today: Notification[];
    earlier: Notification[];
  };
}

const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Subskrypcja Firestore trzymana poza stanem.
let unsubscribe: (() => void) | null = null;

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  currentUid: null,

  startSync: (uid) => {
    if (get().currentUid === uid && unsubscribe) return;
    unsubscribe?.();
    set({ currentUid: uid, notifications: [], unreadCount: 0 });
    unsubscribe = subscribeNotifications(uid, (notifications) => {
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      });
    });
  },

  stopSync: () => {
    unsubscribe?.();
    unsubscribe = null;
    set({ notifications: [], unreadCount: 0, currentUid: null });
  },

  addNotification: (id, data) => {
    const uid = get().currentUid;
    if (!uid) return;
    // Dedup: jeśli alert o tym id już istnieje, nie nadpisuj (zachowaj read/createdAt).
    if (get().notifications.some((n) => n.id === id)) return;
    createNotificationDoc(uid, id, data).catch(() => {});
  },

  markAllRead: () => {
    const uid = get().currentUid;
    if (!uid) return;
    const unreadIds = get()
      .notifications.filter((n) => !n.read)
      .map((n) => n.id);
    markAllNotificationsReadDocs(uid, unreadIds).catch(() => {});
  },

  markAsRead: (id) => {
    const uid = get().currentUid;
    if (!uid) return;
    markNotificationReadDoc(uid, id).catch(() => {});
  },

  removeNotification: (id) => {
    const uid = get().currentUid;
    if (!uid) return;
    deleteNotificationDoc(uid, id).catch(() => {});
  },

  clearAll: () => {
    const uid = get().currentUid;
    if (!uid) return;
    const ids = get().notifications.map((n) => n.id);
    deleteAllNotificationsDocs(uid, ids).catch(() => {});
  },

  getNotificationsGrouped: () => {
    const notifications = get().notifications;
    return {
      today: notifications.filter((n) => isToday(n.createdAt)),
      earlier: notifications.filter((n) => !isToday(n.createdAt)),
    };
  },
}));
