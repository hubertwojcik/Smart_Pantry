import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useAuthStore } from "../store/authStore";
import {
  fontFamily,
  fontSize,
  spacing,
  radius,
  shadows,
} from "../constants/theme";
import { AuthStackParamList } from "./LoginScreen";
import Animated, { FadeInUp } from "react-native-reanimated";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Register">;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();
  const register = useAuthStore((state) => state.register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleRegister = () => {
    if (!name.trim()) {
      Alert.alert("Błąd", "Wpisz imię i nazwisko");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Błąd", "Wpisz poprawny adres e-mail");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Błąd", "Hasło musi mieć co najmniej 6 znaków");
      return;
    }
    if (!termsAccepted) {
      Alert.alert("Błąd", "Zaakceptuj regulamin, aby kontynuować");
      return;
    }
    register(name.trim(), email.trim().toLowerCase(), password);
  };

  const inputBorderColor = (focused: boolean) =>
    focused ? colors.primary : colors.border;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <Animated.View
        style={[styles.header, { borderBottomColor: colors.border }]}
        entering={FadeInUp.delay(0).springify()}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.charcoal }]}>
          Smart Pantry
        </Text>
        <View style={styles.backButton} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Headline */}
          <View style={styles.headlineSection}>
            <Animated.View entering={FadeInUp.delay(100).springify()}>
              <Text style={[styles.overline, { color: colors.gray }]}>
                PANTRY MANAGER
              </Text>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(200).springify()}>
              <Text style={[styles.headline, { color: colors.charcoal }]}>
                Zacznij dbać o swoje{" "}
                <Text style={{ color: colors.primary }}>zapasy</Text>.
              </Text>
            </Animated.View>
          </View>

          {/* Card */}
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                rowGap: 4,
              },
              isDark && styles.cardDark,
            ]}
            entering={FadeInUp.delay(300).springify()}
          >
            <Animated.View entering={FadeInUp.delay(400).springify()}>
              <Text style={[styles.cardTitle, { color: colors.charcoal }]}>
                Stwórz konto
              </Text>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(500).springify()}>
              <Text style={[styles.cardSubtitle, { color: colors.gray }]}>
                Dołącz do ekosystemu inteligentnego zarządzania.
              </Text>
            </Animated.View>

            {/* Name */}
            <Animated.View entering={FadeInUp.delay(600).springify()}>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: inputBorderColor(nameFocused),
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.charcoal }]}
                  placeholder="Imię i nazwisko"
                  placeholderTextColor={colors.gray}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>
            </Animated.View>

            {/* Email */}
            <Animated.View entering={FadeInUp.delay(700).springify()}>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: inputBorderColor(emailFocused),
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.charcoal }]}
                  placeholder="Email"
                  placeholderTextColor={colors.gray}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </Animated.View>

            {/* Password */}
            <Animated.View entering={FadeInUp.delay(800).springify()}>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: inputBorderColor(passwordFocused),
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.charcoal }]}
                  placeholder="Hasło"
                  placeholderTextColor={colors.gray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.gray}
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Terms */}
            <Animated.View entering={FadeInUp.delay(900).springify()}>
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setTermsAccepted((v) => !v)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: termsAccepted
                        ? colors.primary
                        : colors.border,
                      backgroundColor: termsAccepted
                        ? colors.primary
                        : "transparent",
                    },
                  ]}
                >
                  {termsAccepted && (
                    <Ionicons name="checkmark" size={12} color={colors.white} />
                  )}
                </View>
                <Text style={[styles.termsText, { color: colors.gray }]}>
                  Akceptuję{" "}
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: fontFamily.medium,
                    }}
                  >
                    Regulamin
                  </Text>{" "}
                  oraz{" "}
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: fontFamily.medium,
                    }}
                  >
                    Politykę Prywatności
                  </Text>{" "}
                  serwisu Smart Pantry.
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Submit */}
            <Animated.View entering={FadeInUp.delay(1000).springify()}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleRegister}
                activeOpacity={0.85}
              >
                <Text style={[styles.submitText, { color: colors.white }]}>
                  Zarejestruj się
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={colors.white}
                  style={{ marginLeft: spacing.sm }}
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Login link */}
            <Animated.View entering={FadeInUp.delay(1100).springify()}>
              <View
                style={[styles.loginRow, { borderTopColor: colors.border }]}
              >
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={[styles.loginText, { color: colors.gray }]}>
                    Masz już konto?{" "}
                    <Text
                      style={{
                        color: colors.primary,
                        fontFamily: fontFamily.semiBold,
                      }}
                    >
                      Zaloguj się
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    height: 56,
    borderBottomWidth: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headlineSection: {
    marginBottom: spacing.xl,
  },
  overline: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  headline: {
    fontFamily: fontFamily.semiBold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    ...shadows.card,
  },
  cardDark: {
    shadowOpacity: 0,
    elevation: 0,
  },
  cardTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xxl,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginBottom: spacing.xl,
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1.5,
    height: 56,
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
  },
  eyeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  termsText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: 20,
    flex: 1,
  },
  submitButton: {
    height: 56,
    borderRadius: radius.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...shadows.card,
  },
  submitText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    letterSpacing: 0.3,
  },
  loginRow: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    alignItems: "center",
  },
  loginText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
});
