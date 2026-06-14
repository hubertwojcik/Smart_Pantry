import { ga4Config, isGa4Configured } from "../../config";
import { getClientId, SESSION_ID } from "./client";

const ENDPOINT = "https://www.google-analytics.com/mp/collect";

/**
 * Wysyła zdarzenie do Google Analytics 4 przez Measurement Protocol (HTTP).
 *
 * To podejście działa w React Native bez natywnych modułów — webowy moduł
 * `firebase/analytics` nie działa w RN. Zdarzenia pojawiają się w panelu GA4
 * (Realtime / DebugView / Events).
 *
 * Nazwa zdarzenia: tylko [a-z0-9_], musi zaczynać się literą, maks. 40 znaków.
 */
export const sendGa4Event = async (
  name: string,
  params: Record<string, unknown> = {},
  userId?: string | null,
): Promise<void> => {
  if (!isGa4Configured) return;
  try {
    const url =
      `${ENDPOINT}?measurement_id=${encodeURIComponent(ga4Config.measurementId)}` +
      `&api_secret=${encodeURIComponent(ga4Config.apiSecret)}`;

    await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        client_id: getClientId(),
        ...(userId ? { user_id: userId } : {}),
        events: [
          {
            name,
            params: {
              session_id: SESSION_ID,
              engagement_time_msec: 100,
              ...params,
            },
          },
        ],
      }),
    });
  } catch {
    // Analityka nie może wywrócić aplikacji — błędy sieci ignorujemy.
  }
};
