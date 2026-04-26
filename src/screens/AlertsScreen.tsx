import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionTitle, { color: colors.gray }]}>{title}</Text>
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

    return (
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            {today.length > 0 && (
              <>
                {renderSectionHeader("DZIŚ")}
                {today.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onPress={() => handleNotificationPress(notification)}
                  />
                ))}
              </>
            )}

            {earlier.length > 0 && (
              <>
                {renderSectionHeader("WCZEŚNIEJ")}
                {earlier.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onPress={() => handleNotificationPress(notification)}
                  />
                ))}
              </>
            )}

            {recipeSuggestion && (
              <RecipeSuggestionCard
                title={recipeSuggestion.title}
                description={recipeSuggestion.description}
                onPress={() => {}}
              />
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name="notifications"
            size={24}
            color={colors.primary}
            style={styles.headerIcon}
          />
          <Text style={[styles.headerTitle, { color: colors.charcoal }]}>
            Powiadomienia
          </Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={24} color={colors.charcoal} />
        </TouchableOpacity>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
  },
  settingsButton: {
    padding: spacing.sm,
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
