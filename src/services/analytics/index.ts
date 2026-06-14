import { firebaseAuth } from "../firebase";
import { sendGa4Event } from "./ga4";
import { logBehaviorEvent } from "./behavior";

const getCurrentUser = () => {
  const user = firebaseAuth.currentUser;
  return user ? { uid: user.uid, email: user.email ?? "" } : null;
};

/**
 * Jeden punkt wejścia do analityki. Każde zdarzenie trafia jednocześnie do:
 *  - Google Analytics 4 (Measurement Protocol)
 *  - Firestore (analiza zachowań / "Hotjar dla mobile")
 */
export const analytics = {
  /** Wejście na ekran (np. przy zmianie zakładki/ekranu w nawigacji). */
  screenView(screenName: string) {
    const user = getCurrentUser();
    sendGa4Event("screen_view", { screen_name: screenName }, user?.uid);
    logBehaviorEvent("screen_view", { screen: screenName }, user);
  },

  /** Dowolna akcja użytkownika (kliknięcie, sukces logowania itp.). */
  track(action: string, params: Record<string, unknown> = {}) {
    const user = getCurrentUser();
    sendGa4Event(action, params, user?.uid);
    logBehaviorEvent(action, params, user);
  },
};
