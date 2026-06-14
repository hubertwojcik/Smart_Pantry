import React, { useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { fontFamily, fontSize, spacing } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useNotificationStore } from "../store/notificationStore";
import { useProductStore } from "../store/productStore";
import { Notification as NotificationType } from "../types";
import {
  NotificationCard,
  RecipeSuggestionCard,
  EmptyState,
} from "../components";
import { RootStackParamList } from "../navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Kaskada wejścia "z góry na dół" (jak na ekranie Zapasy).
const ENTER_STEP = 60;

const RECIPE_SUGGESTIONS = [
  {
    title: "Masz produkty na domowy sos tzatziki",
    description: "Wykorzystaj jogurt grecki i ogórki zanim stracą świeżość.",
    ingredients: ["jogurt", "ogórek"],
  },
  {
    title: "Masz produkty na jajecznicę",
    description: "Wykorzystaj jajka i warzywa zanim stracą świeżość.",
    ingredients: ["jajka", "pomidor"],
  },
  {
    title: "Masz produkty na sałatkę",
    description: "Wykorzystaj świeże warzywa zanim stracą świeżość.",
    ingredients: ["sałata", "pomidor", "ogórek"],
  },
];

export const AlertsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const notifications = useNotificationStore((state) => state.notifications);
  const getNotificationsGrouped = useNotificationStore(
    (state) => state.getNotificationsGrouped
  );
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const getExpiringSoon = useProductStore((state) => state.getExpiringSoon);

  useEffect(() => {
    markAllRead();
  }, []);

  const { today, earlier } = getNotificationsGrouped();
  const expiringSoon = getExpiringSoon();

  const getRecipeSuggestion = useCallback(() => {
    if (expiringSoon.length < 2) return null;

    const productNames = expiringSoon.map((p) => p.name.toLowerCase());

    for (const recipe of RECIPE_SUGGESTIONS) {
      const hasIngredients = recipe.ingredients.some((ingredient) =>
        productNames.some((name) => name.includes(ingredient))
      );
      if (hasIngredients) {
        return recipe;
      }
    }
    return null;
  }, [expiringSoon]);

  const recipeSuggestion = getRecipeSuggestion();

  const handleNotificationPress = useCallback(
    (notification: NotificationType) => {
      navigation.navigate("ProductDetail", { productId: notification.productId });
    },
    [navigation]
  );

  const renderContent = () => {
    if (notifications.length === 0) {
      return (
        <EmptyState
          icon="checkmark-circle"
          iconColor={colors.statusGreen}
          title="Wszystko świeże!"
          subtitle="Nie masz żadnych powiadomień o produktach"
        />
      );
    }

    // Delay bazowy sekcji "Wcześniej" = po nagłówku, tytule i kartach z "Dziś".
    const earlierBase = 1 + (today.length > 0 ? 1 + today.length : 0);

    return (
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            {today.length > 0 && (
              <>
                <Animated.Text
                  style={[styles.sectionTitle, { color: colors.gray }]}
                  entering={FadeInDown.delay(ENTER_STEP).springify()}
                >
                  DZIŚ
                </Animated.Text>
                {today.map((notification, index) => (
                  <Animated.View
                    key={notification.id}
                    entering={FadeInDown.delay(
                      (2 + index) * ENTER_STEP,
                    ).springify()}
                  >
                    <NotificationCard
                      notification={notification}
                      onPress={() => handleNotificationPress(notification)}
                    />
                  </Animated.View>
                ))}
              </>
            )}

            {earlier.length > 0 && (
              <>
                <Animated.Text
                  style={[styles.sectionTitle, { color: colors.gray }]}
                  entering={FadeInDown.delay(earlierBase * ENTER_STEP).springify()}
                >
                  WCZEŚNIEJ
                </Animated.Text>
                {earlier.map((notification, index) => (
                  <Animated.View
                    key={notification.id}
                    entering={FadeInDown.delay(
                      (earlierBase + 1 + index) * ENTER_STEP,
                    ).springify()}
                  >
                    <NotificationCard
                      notification={notification}
                      onPress={() => handleNotificationPress(notification)}
                      dimmed
                    />
                  </Animated.View>
                ))}
              </>
            )}
          </>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={styles.header}
        entering={FadeInDown.delay(0).springify()}
      >
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          Powiadomienia
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.gray }]}>
          Zarządzaj terminami ważności i zapasami
        </Text>
      </Animated.View>

      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.display,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
});
