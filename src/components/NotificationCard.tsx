import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, fontFamily, fontSize, spacing, shadows } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { Notification as NotificationType, ExpiryStatus } from "../types";
import { formatRelativeTime } from "../services/expiryService";

interface NotificationCardProps {
  notification: NotificationType;
  onPress?: () => void;
  /** Wyszarzenie kart w sekcji "Wcześniej". */
  dimmed?: boolean;
}

const getIconForNotification = (
  status: ExpiryStatus,
  type: string,
  colors: {
    statusGreen: string;
    statusRed: string;
    statusAmber: string;
    tertiary: string;
    gray: string;
  },
): { name: keyof typeof Ionicons.glyphMap; color: string } => {
  if (type === "restock") {
    return { name: "cart", color: colors.tertiary };
  }
  if (type === "info") {
    return { name: "information-circle", color: colors.gray };
  }
  // type === "expiry"
  switch (status) {
    case "expired":
    case "critical":
      return { name: "warning", color: colors.statusRed };
    case "warning":
      return { name: "warning", color: colors.statusAmber };
    default:
      return { name: "checkmark-circle", color: colors.statusGreen };
  }
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  dimmed = false,
}) => {
  const { colors, isDark } = useTheme();
  const { name, color } = getIconForNotification(
    notification.status,
    notification.type,
    colors,
  );
  const timeString = formatRelativeTime(notification.createdAt);
  const isImportant =
    notification.type === "expiry" &&
    (notification.status === "critical" || notification.status === "expired");

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        isDark && styles.cardDark,
        dimmed && styles.dimmed,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}1F` }]}>
        <Ionicons name={name} size={22} color={color} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[styles.productName, { color: colors.charcoal }]}
            numberOfLines={1}
          >
            {notification.productName}
          </Text>
          <Text style={[styles.time, { color: colors.gray }]}>{timeString}</Text>
        </View>
        <Text style={[styles.message, { color: colors.gray }]} numberOfLines={2}>
          {notification.message}
        </Text>
        {isImportant && (
          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: `${color}1A` }]}>
              <Text style={[styles.tagText, { color }]}>Ważne</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    ...shadows.card,
  },
  cardDark: {
    shadowOpacity: 0,
    elevation: 0,
  },
  dimmed: {
    opacity: 0.8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  productName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    flex: 1,
    marginRight: spacing.sm,
  },
  time: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
  },
  message: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: 19,
  },
  tagRow: {
    flexDirection: "row",
    marginTop: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
  },
});
