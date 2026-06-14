import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./index";
import { Notification } from "../../types";

/** Powiadomienia per-użytkownik: users/{uid}/notifications/{notifId}. */
const notificationsCollection = (uid: string) =>
  collection(db, "users", uid, "notifications");

const notificationDoc = (uid: string, id: string) =>
  doc(db, "users", uid, "notifications", id);

/** Dane zapisywane przy tworzeniu (bez pól nadawanych automatycznie). */
type NewNotification = Omit<Notification, "id" | "read" | "createdAt">;

export const subscribeNotifications = (
  uid: string,
  onChange: (notifications: Notification[]) => void,
) =>
  onSnapshot(notificationsCollection(uid), (snapshot) => {
    const items = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        productId: data.productId ?? "",
        productName: data.productName ?? "",
        message: data.message ?? "",
        status: data.status,
        type: data.type ?? "expiry",
        read: data.read ?? false,
        // serverTimestamp bywa chwilowo null tuż po zapisie — fallback na teraz.
        createdAt:
          data.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
      } as Notification;
    });
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    onChange(items);
  });

/**
 * Tworzy dokument o DETERMINISTYCZNYM id (np. expiry-<productId>-<daysLeft>).
 * Dzięki temu ten sam alert nigdy nie zduplikuje się — kolejny zapis nadpisuje
 * istniejący dokument zamiast tworzyć nowy wiersz.
 */
export const createNotificationDoc = (
  uid: string,
  id: string,
  data: NewNotification,
) =>
  setDoc(notificationDoc(uid, id), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });

export const markNotificationReadDoc = (uid: string, id: string) =>
  updateDoc(notificationDoc(uid, id), { read: true });

export const markAllNotificationsReadDocs = async (
  uid: string,
  ids: string[],
) => {
  if (ids.length === 0) return;
  const batch = writeBatch(db);
  ids.forEach((id) => batch.update(notificationDoc(uid, id), { read: true }));
  await batch.commit();
};

export const deleteNotificationDoc = (uid: string, id: string) =>
  deleteDoc(notificationDoc(uid, id));

export const deleteAllNotificationsDocs = async (uid: string, ids: string[]) => {
  if (ids.length === 0) return;
  const batch = writeBatch(db);
  ids.forEach((id) => batch.delete(notificationDoc(uid, id)));
  await batch.commit();
};
