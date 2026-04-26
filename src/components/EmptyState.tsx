import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, fontFamily, fontSize, spacing } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconColor,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  const { colors } = useTheme();
  const resolvedIconColor = iconColor ?? colors.gray;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${resolvedIconColor}15` },
        ]}
      >
        <Ionicons name={icon} size={48} color={resolvedIconColor} />
      </View>
      <Text style={[styles.title, { color: colors.charcoal }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.gray }]}>{subtitle}</Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl * 2,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  button: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
  },
});
