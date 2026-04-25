import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, fontFamily, fontSize, spacing } from "../constants/theme";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.decrementButton]}
        onPress={handleDecrement}
        disabled={value <= min}
        activeOpacity={0.7}
      >
        <Ionicons
          name="remove"
          size={20}
          color={value <= min ? colors.border : colors.gray}
        />
      </TouchableOpacity>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
      </View>
      <TouchableOpacity
        style={[styles.button, styles.incrementButton]}
        onPress={handleIncrement}
        disabled={value >= max}
        activeOpacity={0.7}
      >
        <Ionicons
          name="add"
          size={20}
          color={value >= max ? colors.border : colors.white}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
  },
  decrementButton: {
    backgroundColor: colors.surfaceContainerLow,
  },
  incrementButton: {
    backgroundColor: colors.primary,
  },
  valueContainer: {
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    color: colors.charcoal,
  },
});
