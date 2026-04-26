import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
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
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
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

const AppContent = () => {
  const { isDark, colors } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const products = useProductStore((state) => state.products);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        await requestNotificationPermissions();
        registerBackgroundTask().catch(() => {});
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
      runExpiryCheckForeground(products).catch(() => {});
    }
  }, [appIsReady, products]);

  if (!fontsLoaded || !appIsReady) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.gray }]}>
          Ładowanie...
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Navigation />
    </GestureHandlerRootView>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
