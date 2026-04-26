import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { radius, fontFamily, fontSize, spacing } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  active,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          { color: active ? colors.white : colors.primary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  text: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
});
