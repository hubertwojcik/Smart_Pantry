import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MMKVStorage, STORAGE_KEYS } from "../storage";
import { Notification, ExpiryStatus } from "../types";

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    n: Omit<Notification, "id" | "createdAt" | "read">
  ) => void;
  markAllRead: () => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getNotificationsGrouped: () => {
    today: Notification[];
    earlier: Notification[];
  };
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (n) => {
        const newNotification: Notification = {
          ...n,
          id: generateId(),
          createdAt: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAllRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification && !notification.read) {
            return {
              notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            };
          }
          return state;
        });
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.read;
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      getNotificationsGrouped: () => {
        const notifications = get().notifications;
        return {
          today: notifications.filter((n) => isToday(n.createdAt)),
          earlier: notifications.filter((n) => !isToday(n.createdAt)),
        };
      },
    }),
    {
      name: STORAGE_KEYS.NOTIFICATIONS,
      storage: createJSONStorage(() => MMKVStorage),
    }
  )
);
