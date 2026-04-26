import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../context/ThemeContext";
import { useAuthStore } from "../store/authStore";
import { fontFamily, fontSize, spacing, radius, shadows } from "../constants/theme";
import { RootStackParamList } from "../navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark, toggleTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.charcoal }]}>
          Ustawienia
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User card */}
        <View
          style={[
            styles.userCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
            isDark && styles.cardDark,
          ]}
        >
          <View style={[styles.avatarCircle, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.charcoal }]}>
              {user?.name ?? "Użytkownik"}
            </Text>
            <Text style={[styles.userEmail, { color: colors.gray }]}>
              {user?.email ?? ""}
            </Text>
          </View>
        </View>

        {/* Wygląd */}
        <Text style={[styles.sectionLabel, { color: colors.gray }]}>WYGLĄD</Text>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
            isDark && styles.cardDark,
          ]}
        >
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View>
                <Text style={[styles.rowLabel, { color: colors.charcoal }]}>
                  Tryb ciemny
                </Text>
                <Text style={[styles.rowSubLabel, { color: colors.gray }]}>
                  {isDark ? "Włączony" : "Wyłączony"}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: `${colors.primary}60` }}
              thumbColor={isDark ? colors.primary : colors.surfaceContainerHigh}
            />
          </View>
        </View>

        {/* Konto */}
        <Text style={[styles.sectionLabel, { color: colors.gray }]}>KONTO</Text>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
            isDark && styles.cardDark,
          ]}
        >
          <TouchableOpacity
            style={styles.row}
            onPress={logout}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIcon,
                  { backgroundColor: `${colors.statusRed}15` },
                ]}
              >
                <Ionicons name="log-out-outline" size={20} color={colors.statusRed} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.statusRed }]}>
                Wyloguj się
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.gray} />
          </TouchableOpacity>
        </View>

        {/* App info */}
        <Text style={[styles.appVersion, { color: colors.gray }]}>
          Inteligentna Spiżarnia v1.0.0
        </Text>
      </ScrollView>
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
    paddingVertical: spacing.md,
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
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl * 2,
    paddingTop: spacing.md,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.lg,
    ...shadows.card,
  },
  cardDark: {
    shadowOpacity: 0,
    elevation: 0,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    marginBottom: 2,
  },
  userEmail: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  sectionLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  section: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  rowLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
  },
  rowSubLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: 1,
  },
  appVersion: {
    textAlign: "center",
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: spacing.xl,
  },
});
