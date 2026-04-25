import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radius, fontFamily, fontSize, spacing } from "../constants/theme";

type Unit = "g" | "ml" | "szt";

interface UnitToggleProps {
  value: Unit;
  onChange: (unit: Unit) => void;
}

export const UnitToggle: React.FC<UnitToggleProps> = ({ value, onChange }) => {
  const units: Unit[] = ["g", "ml", "szt"];

  return (
    <View style={styles.container}>
      {units.map((unit) => (
        <TouchableOpacity
          key={unit}
          style={[styles.button, value === unit && styles.buttonActive]}
          onPress={() => onChange(unit)}
          activeOpacity={0.7}
        >
          <Text style={[styles.text, value === unit && styles.textActive]}>
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
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.pill,
    padding: 2,
  },
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  buttonActive: {
    backgroundColor: colors.primary,
  },
  text: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  textActive: {
    color: colors.white,
  },
});
