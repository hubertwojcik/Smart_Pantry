import * as Notifications from "expo-notifications";
import { Product, ExpiryStatus } from "../types";
import { getDaysUntilExpiry, getExpiryStatus } from "./expiryService";
import { storage, STORAGE_KEYS } from "../storage";
import { useNotificationStore } from "../store/notificationStore";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

export const scheduleExpiryNotification = async (
  product: Product,
  daysLeft: number,
): Promise<string | null> => {
  try {
    let title = "🥫 Inteligentna Spiżarnia";
    let body = "";

    if (daysLeft === 0) {
      body = `Produkt "${product.name}" wygasa DZISIAJ! Zużyj jak najszybciej.`;
    } else if (daysLeft === 1) {
      body = `Produkt "${product.name}" wygasa JUTRO!`;
    } else if (daysLeft <= 7) {
      body = `Produkt "${product.name}" kończy się termin ważności za ${daysLeft} dni.`;
    } else {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { productId: product.id },
      },
      trigger: null,
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
};

export const runExpiryCheckForeground = async (products: Product[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sentRaw = storage.getString(STORAGE_KEYS.SENT_NOTIFICATIONS) ?? "[]";
  const sent: string[] = JSON.parse(sentRaw);
  const newSent = [...sent];

  for (const product of products) {
    const daysLeft = getDaysUntilExpiry(product.expiryDate);
    const status = getExpiryStatus(product.expiryDate);

    if (daysLeft <= 7 && daysLeft >= 0) {
      const notifId = `expiry-${product.id}-${daysLeft}`;

      if (sent.includes(notifId)) {
        continue;
      }

      let message = "";
      if (daysLeft === 0) {
        message = `Termin ważności upływa dzisiaj. Zużyj jak najszybciej!`;
      } else if (daysLeft === 1) {
        message = `Wygasa jutro! Zaplanuj posiłek.`;
      } else {
        message = `Zostały ${daysLeft} dni do końca terminu. Zaplanuj posiłek.`;
      }

      useNotificationStore.getState().addNotification({
        productId: product.id,
        productName: product.name,
        message,
        status,
        type: "expiry",
      });

      await scheduleExpiryNotification(product, daysLeft);
      newSent.push(notifId);
    }

    if (daysLeft < 0) {
      const notifId = `expired-${product.id}`;
      if (!sent.includes(notifId)) {
        useNotificationStore.getState().addNotification({
          productId: product.id,
          productName: product.name,
          message: `Produkt przeterminował się ${Math.abs(daysLeft)} dni temu.`,
          status: "expired",
          type: "expiry",
        });
        newSent.push(notifId);
      }
    }
  }

  storage.set(STORAGE_KEYS.SENT_NOTIFICATIONS, JSON.stringify(newSent));
};

export const clearSentNotificationsForProduct = (productId: string) => {
  const sentRaw = storage.getString(STORAGE_KEYS.SENT_NOTIFICATIONS) ?? "[]";
  const sent: string[] = JSON.parse(sentRaw);
  const filtered = sent.filter((id) => !id.includes(productId));
  storage.set(STORAGE_KEYS.SENT_NOTIFICATIONS, JSON.stringify(filtered));
};

export const cancelAllScheduledNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
