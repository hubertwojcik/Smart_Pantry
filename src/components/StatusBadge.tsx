import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { radius, fontFamily, fontSize, spacing } from "../constants/theme";
import {
  getExpiryStatus,
  getStatusColor,
  getStatusLabel,
} from "../services/expiryService";

interface StatusBadgeProps {
  expiryDate: string;
  size?: "small" | "medium";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  expiryDate,
  size = "medium",
}) => {
  const label = getStatusLabel(expiryDate);
  const color = getStatusColor(getExpiryStatus(expiryDate));

  return (
    <View
      style={[
        styles.badge,
        // Miękki "container": delikatnie wybarwione tło + nasycony tekst.
        { backgroundColor: `${color}1F` },
        size === "small" && styles.badgeSmall,
      ]}
    >
      <Text
        style={[styles.text, { color }, size === "small" && styles.textSmall]}
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
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  text: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 10,
  },
});
