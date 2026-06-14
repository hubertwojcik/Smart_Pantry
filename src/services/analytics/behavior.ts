import { Platform } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { BEHAVIOR_EVENTS_COLLECTION, isFirebaseConfigured } from "../../config";
import { getClientId, SESSION_ID } from "./client";

interface EventUser {
  uid: string;
  email: string;
}

/**
 * Zapisuje zdarzenie zachowania użytkownika do Firestore.
 *
 * To nasz "Hotjar dla mobile": każdy wpis mówi KTO (userId/clientId), GDZIE
 * (ekran), CO ZROBIŁ (event + params) i KIEDY. Zdarzenia można przeglądać i
 * filtrować w konsoli Firestore (kolekcja `analytics_events`).
 */
export const logBehaviorEvent = async (
  event: string,
  params: Record<string, unknown>,
  user: EventUser | null,
): Promise<void> => {
  if (!isFirebaseConfigured) return;
  try {
    await addDoc(collection(db, BEHAVIOR_EVENTS_COLLECTION), {
      event,
      ...params,
      userId: user?.uid ?? null,
      userEmail: user?.email ?? null,
      clientId: getClientId(),
      sessionId: SESSION_ID,
      platform: Platform.OS,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Analityka nie może wywrócić aplikacji.
  }
};
