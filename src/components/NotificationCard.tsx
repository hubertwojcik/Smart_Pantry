import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, fontFamily, fontSize, spacing, shadows } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { Notification as NotificationType, ExpiryStatus } from "../types";
import { getStatusColor, formatRelativeTime } from "../services/expiryService";

interface NotificationCardProps {
  notification: NotificationType;
  onPress?: () => void;
  onDismiss?: () => void;
}

const getIconForStatus = (
  status: ExpiryStatus,
  type: string,
  colors: { statusGreen: string; statusRed: string; statusAmber: string; gray: string }
): { name: keyof typeof Ionicons.glyphMap; color: string } => {
  if (type === "restock") {
    return { name: "checkmark-circle", color: colors.statusGreen };
  }
  switch (status) {
    case "expired":
    case "critical":
      return { name: "alert-circle", color: colors.statusRed };
    case "warning":
      return { name: "warning", color: colors.statusAmber };
    case "ok":
      return { name: "checkmark-circle", color: colors.statusGreen };
    default:
      return { name: "information-circle", color: colors.gray };
  }
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onDismiss,
}) => {
  const { colors, isDark } = useTheme();
  const { name, color } = getIconForStatus(
    notification.status,
    notification.type,
    colors
  );
  const timeString = formatRelativeTime(notification.createdAt);

  const progressWidth =
    notification.status === "expired"
      ? 100
      : notification.status === "critical"
      ? 90
      : notification.status === "warning"
      ? 50
      : 20;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        isDark && styles.cardDark,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={name} size={24} color={color} />
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
        <Text
          style={[styles.message, { color: colors.gray }]}
          numberOfLines={2}
        >
          {notification.message}
        </Text>
        <View
          style={[
            styles.progressContainer,
            { backgroundColor: colors.surfaceContainerLow },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              { width: `${progressWidth}%`, backgroundColor: color },
            ]}
          />
        </View>
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
    ...shadows.card,
  },
  cardDark: {
    shadowOpacity: 0,
    elevation: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
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
    marginBottom: spacing.xs,
  },
  productName: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    flex: 1,
    marginRight: spacing.sm,
  },
  time: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
  message: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
});
