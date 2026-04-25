import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import { createMMKV } from "react-native-mmkv";
import { Product } from "../types";
import { STORAGE_KEYS } from "../storage";

export const BACKGROUND_TASK_NAME = "PANTRY_EXPIRY_CHECK";

const getStorage = () => {
  return createMMKV({
    id: "pantry-storage",
    encryptionKey: "pantry-secret-key",
  });
};

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    const storage = getStorage();
    const raw = storage.getString(STORAGE_KEYS.PRODUCTS);

    if (!raw) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(raw);
    } catch {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const products: Product[] =
      parsedData.state?.products || parsedData.products || [];

    if (products.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sentRaw = storage.getString(STORAGE_KEYS.SENT_NOTIFICATIONS) ?? "[]";
    const sent: string[] = JSON.parse(sentRaw);
    const newSent = [...sent];

    for (const product of products) {
      const expiry = new Date(product.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil(
        (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysLeft <= 7 && daysLeft >= 0) {
        const notifId = `expiry-${product.id}-${daysLeft}`;

        if (sent.includes(notifId)) {
          continue;
        }

        let message = "";
        if (daysLeft === 0) {
          message = `Produkt "${product.name}" wygasa DZISIAJ! Zużyj jak najszybciej.`;
        } else if (daysLeft === 1) {
          message = `Produkt "${product.name}" wygasa JUTRO!`;
        } else {
          message = `Produkt "${product.name}" kończy się termin ważności za ${daysLeft} dni.`;
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "🥫 Inteligentna Spiżarnia",
            body: message,
            data: { productId: product.id },
          },
          trigger: null,
        });

        newSent.push(notifId);
      }

      if (daysLeft < 0) {
        const notifId = `expired-${product.id}`;
        if (!sent.includes(notifId)) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "🥫 Inteligentna Spiżarnia",
              body: `Produkt "${product.name}" przeterminował się ${Math.abs(daysLeft)} dni temu.`,
              data: { productId: product.id },
            },
            trigger: null,
          });
          newSent.push(notifId);
        }
      }
    }

    storage.set(STORAGE_KEYS.SENT_NOTIFICATIONS, JSON.stringify(newSent));

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Background task error:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTask = async () => {
  try {
    const status = await BackgroundFetch.getStatusAsync();

    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      console.log("Background fetch is restricted or denied");
      return;
    }

    const isRegistered =
      await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);

    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
        minimumInterval: 60 * 60 * 8,
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log("Background task registered");
    }
  } catch (error) {
    console.error("Error registering background task:", error);
  }
};

export const unregisterBackgroundTask = async () => {
  try {
    const isRegistered =
      await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);

    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);
      console.log("Background task unregistered");
    }
  } catch (error) {
    console.error("Error unregistering background task:", error);
  }
};
