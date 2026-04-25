import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import * as Notifications from "expo-notifications";
import { Navigation } from "./src/navigation";
import { colors } from "./src/constants/theme";
import { useProductStore } from "./src/store/productStore";
import {
  requestNotificationPermissions,
  runExpiryCheckForeground,
} from "./src/services/notificationService";
import { registerBackgroundTask } from "./src/services/backgroundTask";

import "./src/services/backgroundTask";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const products = useProductStore((state) => state.products);

  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  console.log(
    "[App] fontsLoaded:",
    fontsLoaded,
    "fontError:",
    fontError,
    "appIsReady:",
    appIsReady,
  );

  useEffect(() => {
    async function prepare() {
      console.log("[App] Starting initialization...");
      try {
        console.log("[App] Requesting notification permissions...");
        await requestNotificationPermissions();
        console.log("[App] Notification permissions done");

        // Background task registration - don't block app startup
        console.log("[App] Registering background task...");
        registerBackgroundTask().catch((bgError) => {
          // Background tasks may fail on simulator - this is OK
          console.warn(
            "[App] Background task registration failed (expected on simulator):",
            bgError,
          );
        });

        console.log("[App] Initialization complete");
      } catch (e) {
        console.error("[App] Error during app initialization:", e);
      } finally {
        setAppIsReady(true);
      }
    }

    if (fontsLoaded) {
      prepare();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const productId = response.notification.request.content.data?.productId;
        if (productId) {
          console.log("Navigate to product:", productId);
        }
      },
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (appIsReady && products.length > 0) {
      console.log(
        "[App] Running expiry check for",
        products.length,
        "products",
      );
      runExpiryCheckForeground(products).catch((e) => {
        console.warn("[App] Expiry check failed:", e);
      });
    }
  }, [appIsReady, products]);

  if (!fontsLoaded || !appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="dark" />
      <Navigation />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.neutral,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.gray,
  },
});
