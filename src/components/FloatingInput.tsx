import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { colors, radius, fontFamily, fontSize, spacing } from "../constants/theme";

interface FloatingInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  alwaysHighlight?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  required,
  alwaysHighlight,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 6],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [fontSize.md, fontSize.xs],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.gray, isFocused || alwaysHighlight ? colors.primary : colors.gray],
    }),
  };

  const borderColor =
    error
      ? colors.statusRed
      : isFocused || alwaysHighlight
      ? colors.primary
      : colors.border;

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { borderColor }]}>
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Animated.Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.gray}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    position: "absolute",
    left: spacing.lg,
    fontFamily: fontFamily.regular,
  },
  required: {
    color: colors.statusRed,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.charcoal,
    padding: 0,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  error: {
    color: colors.statusRed,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.lg,
  },
});
