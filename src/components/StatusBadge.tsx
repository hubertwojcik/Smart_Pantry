import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, fontFamily, fontSize, spacing } from "../constants/theme";
import { ExpiryStatus } from "../types";
import { getStatusColor, getStatusLabel } from "../services/expiryService";

interface StatusBadgeProps {
  expiryDate: string;
  size?: "small" | "medium";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  expiryDate,
  size = "medium",
}) => {
  const label = getStatusLabel(expiryDate);
  const status = label === "PRZETERMINOWANE" || label === "DZIŚ" || label === "JUTRO"
    ? "critical"
    : label === "OK"
    ? "ok"
    : "warning";
  const backgroundColor = getStatusColor(status as ExpiryStatus);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor },
        size === "small" && styles.badgeSmall,
      ]}
    >
      <Text
        style={[styles.text, size === "small" && styles.textSmall]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  badgeSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    color: colors.white,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 10,
  },
});
