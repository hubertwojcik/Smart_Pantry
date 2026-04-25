import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  radius,
  fontFamily,
  fontSize,
  spacing,
  shadows,
} from "../constants/theme";
import { Notification as NotificationType, ExpiryStatus } from "../types";
import { getStatusColor, formatRelativeTime, getDaysUntilExpiry } from "../services/expiryService";

interface NotificationCardProps {
  notification: NotificationType;
  onPress?: () => void;
  onDismiss?: () => void;
}

const getIconForStatus = (
  status: ExpiryStatus,
  type: string
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
  const { name, color } = getIconForStatus(notification.status, notification.type);
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
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={name} size={24} color={color} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.productName} numberOfLines={1}>
            {notification.productName}
          </Text>
          <Text style={styles.time}>{timeString}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <View style={styles.progressContainer}>
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
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: "row",
    ...shadows.card,
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
    color: colors.charcoal,
    flex: 1,
    marginRight: spacing.sm,
  },
  time: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.gray,
  },
  message: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    height: 4,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
});
