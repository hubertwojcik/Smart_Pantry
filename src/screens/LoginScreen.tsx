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
import Animated, { FadeInUp, SlideInDown } from "react-native-reanimated";
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Login">;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password) {
      Alert.alert("Błąd", "Wpisz e-mail i hasło");
      return;
    }
    const success = login(email.trim().toLowerCase(), password);
    if (!success) {
      Alert.alert("Błąd logowania", "Nieprawidłowy e-mail lub hasło");
    }
  };

  const inputBorderColor = (focused: boolean) =>
    focused ? colors.primary : colors.border;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Branding */}
          <Animated.View
            style={styles.brandingSection}
            entering={FadeInUp.delay(100).springify()}
          >
            <View
              style={[
                styles.logoContainer,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="nutrition" size={36} color={colors.white} />
            </View>
            <Text style={[styles.appTitle, { color: colors.charcoal }]}>
              Inteligentna Spiżarnia
            </Text>
            <Text style={[styles.appSubtitle, { color: colors.gray }]}>
              Zarządzaj swoimi zapasami z lekkością
            </Text>
          </Animated.View>

          {/* Card */}
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isDark && styles.cardDark,
            ]}
            entering={FadeInUp.delay(300).springify()}
          >
            {/* Email */}
            <Animated.View
              style={styles.inputWrapper}
              entering={FadeInUp.delay(400).springify()}
            >
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: inputBorderColor(emailFocused),
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.gray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.charcoal }]}
                  placeholder="Adres e-mail"
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
            <Animated.View
              style={styles.inputWrapper}
              entering={FadeInUp.delay(500).springify()}
            >
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: inputBorderColor(passwordFocused),
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.gray}
                  style={styles.inputIcon}
                />
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

            {/* Forgot password */}
            <Animated.View
              style={styles.forgotRow}
              entering={FadeInUp.delay(600).springify()}
            >
              <Text style={[styles.forgotText, { color: colors.gray }]}>
                Zapomniałeś hasła?
              </Text>
            </Animated.View>

            {/* Submit */}
            <Animated.View entering={FadeInUp.delay(700).springify()}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleLogin}
                activeOpacity={0.85}
              >
                <Text style={[styles.submitText, { color: colors.white }]}>
                  Zaloguj się
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            style={styles.footer}
            entering={FadeInUp.delay(800).springify()}
          >
            <Text style={[styles.footerText, { color: colors.gray }]}>
              Nie masz konta?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                Zarejestruj się
              </Text>
            </TouchableOpacity>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  brandingSection: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    ...shadows.elevated,
  },
  appTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  appSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    textAlign: "center",
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
  inputIcon: {
    marginRight: spacing.sm,
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
  forgotRow: {
    alignSelf: "flex-end",
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  forgotText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  submitButton: {
    height: 56,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.card,
  },
  submitText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xl,
  },
  footerText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
  },
  footerLink: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
  },
});
