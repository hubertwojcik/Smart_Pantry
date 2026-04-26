import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { radius, fontFamily, fontSize, spacing } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

type Unit = "g" | "ml" | "szt";

interface UnitToggleProps {
  value: Unit;
  onChange: (unit: Unit) => void;
}

export const UnitToggle: React.FC<UnitToggleProps> = ({ value, onChange }) => {
  const { colors } = useTheme();
  const units: Unit[] = ["g", "ml", "szt"];

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surfaceContainerLow }]}
    >
      {units.map((unit) => (
        <TouchableOpacity
          key={unit}
          style={[
            styles.button,
            value === unit && { backgroundColor: colors.primary },
          ]}
          onPress={() => onChange(unit)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.text,
              { color: value === unit ? colors.white : colors.gray },
            ]}
          >
            {unit.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: radius.pill,
    padding: 2,
  },
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  text: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
});
