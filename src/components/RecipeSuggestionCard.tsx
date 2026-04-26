import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, fontFamily, fontSize, spacing } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

interface RecipeSuggestionCardProps {
  title: string;
  description: string;
  onPress: () => void;
}

export const RecipeSuggestionCard: React.FC<RecipeSuggestionCardProps> = ({
  title,
  description,
  onPress,
}) => {
  const { colors, isDark } = useTheme();
  const cardBg = isDark ? "#292524" : "#1C1917";

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.description, { color: colors.gray }]}>{description}</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Zobacz przepis</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    color: "#FFFFFF",
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  button: {
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  buttonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: "#FFFFFF",
    marginRight: spacing.sm,
  },
});
