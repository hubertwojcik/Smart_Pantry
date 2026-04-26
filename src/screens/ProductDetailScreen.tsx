import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { fontFamily, fontSize, spacing, radius, shadows } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useProductStore } from "../store/productStore";
import { Category } from "../types";
import { RootStackParamList } from "../navigation";
import {
  getExpiryStatus,
  getStatusColor,
  getStatusLabel,
  getDaysUntilExpiry,
  formatDate,
} from "../services/expiryService";
import { clearSentNotificationsForProduct } from "../services/notificationService";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "ProductDetail">;

const getCategoryIcon = (category: Category): keyof typeof Ionicons.glyphMap => {
  switch (category) {
    case "Nabiał": return "water-outline";
    case "Pieczywo": return "pizza-outline";
    case "Mięso": return "fish-outline";
    case "Warzywa": return "leaf-outline";
    case "Suche": return "cube-outline";
    case "Napoje": return "cafe-outline";
    default: return "basket-outline";
  }
};

const getCategoryColor = (category: Category): string => {
  switch (category) {
    case "Nabiał": return "#60A5FA";
    case "Pieczywo": return "#FBBF24";
    case "Mięso": return "#F87171";
    case "Warzywa": return "#34D399";
    case "Suche": return "#A78BFA";
    case "Napoje": return "#F472B6";
    default: return "#78716C";
  }
};

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { colors, isDark } = useTheme();
  const { productId } = route.params;

  const product = useProductStore((state) => state.getProductById(productId));
  const removeProduct = useProductStore((state) => state.removeProduct);

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.gray }]}>
            Produkt nie został znaleziony
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = getExpiryStatus(product.expiryDate);
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(product.expiryDate);
  const daysLeft = getDaysUntilExpiry(product.expiryDate);
  const categoryIcon = getCategoryIcon(product.category);
  const categoryColor = getCategoryColor(product.category);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Usuń produkt",
      `Czy na pewno chcesz usunąć "${product.name}" ze spiżarni?`,
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: () => {
            removeProduct(product.id);
            clearSentNotificationsForProduct(product.id);
            navigation.goBack();
          },
        },
      ]
    );
  }, [product, removeProduct, navigation]);

  const getStatusMessage = () => {
    if (status === "expired") return `Przeterminowany ${Math.abs(daysLeft)} dni temu`;
    if (daysLeft === 0) return "Wygasa dzisiaj!";
    if (daysLeft === 1) return "Wygasa jutro!";
    return `Wygasa za ${daysLeft} dni`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: colors.charcoal }]}
          numberOfLines={1}
        >
          {product.name}
        </Text>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color={colors.charcoal} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.iconPlaceholder,
                { backgroundColor: `${categoryColor}20` },
              ]}
            >
              <Ionicons name={categoryIcon} size={64} color={categoryColor} />
            </View>
          )}
        </View>

        <View style={[styles.statusBanner, { backgroundColor: statusColor }]}>
          <View style={styles.statusContent}>
            <Text style={styles.statusLabel}>{statusLabel}</Text>
            <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          {[
            { label: "Gramatura", value: product.weight > 0 ? `${product.weight} ${product.weightUnit}` : `${product.quantity} szt` },
            { label: "Kategoria", value: product.category },
            { label: "Lokalizacja", value: product.location || "Nie określono" },
            { label: "Dodano", value: formatDate(product.addedAt) },
          ].map(({ label, value }) => (
            <View
              key={label}
              style={[
                styles.infoCard,
                { backgroundColor: colors.surface },
                isDark && styles.infoCardDark,
              ]}
            >
              <Text style={[styles.infoLabel, { color: colors.gray }]}>{label}</Text>
              <Text style={[styles.infoValue, { color: colors.charcoal }]}>{value}</Text>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.expirySection,
            { backgroundColor: colors.surface },
            isDark && styles.infoCardDark,
          ]}
        >
          <Text style={[styles.expirySectionTitle, { color: colors.gray }]}>
            Data ważności
          </Text>
          <Text style={[styles.expiryDate, { color: colors.charcoal }]}>
            {formatDate(product.expiryDate)}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.consumeButton, { backgroundColor: colors.primary }]}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
          <Text style={[styles.consumeButtonText, { color: colors.white }]}>
            Zjedzone / Zużyte
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.editButtonBottom,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          activeOpacity={0.8}
        >
          <Text style={[styles.editButtonText, { color: colors.charcoal }]}>Edytuj</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    textAlign: "center",
    marginHorizontal: spacing.md,
  },
  editButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  imageContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: radius.lg,
  },
  iconPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBanner: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  statusContent: {
    alignItems: "center",
  },
  statusLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  statusMessage: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  infoCard: {
    width: "47%",
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  infoCardDark: {
    shadowOpacity: 0,
    elevation: 0,
  },
  infoLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
  },
  expirySection: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: "center",
    ...shadows.card,
  },
  expirySectionTitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  expiryDate: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
  },
  bottomContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  consumeButton: {
    flex: 1,
    flexDirection: "row",
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadows.card,
  },
  consumeButtonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
  },
  editButtonBottom: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  editButtonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
  },
});
