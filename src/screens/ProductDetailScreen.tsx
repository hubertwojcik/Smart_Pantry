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
import {
  colors,
  fontFamily,
  fontSize,
  spacing,
  radius,
  shadows,
} from "../constants/theme";
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
    case "Nabiał":
      return "water-outline";
    case "Pieczywo":
      return "pizza-outline";
    case "Mięso":
      return "fish-outline";
    case "Warzywa":
      return "leaf-outline";
    case "Suche":
      return "cube-outline";
    case "Napoje":
      return "cafe-outline";
    default:
      return "basket-outline";
  }
};

const getCategoryColor = (category: Category): string => {
  switch (category) {
    case "Nabiał":
      return "#60A5FA";
    case "Pieczywo":
      return "#FBBF24";
    case "Mięso":
      return "#F87171";
    case "Warzywa":
      return "#34D399";
    case "Suche":
      return "#A78BFA";
    case "Napoje":
      return "#F472B6";
    default:
      return colors.gray;
  }
};

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { productId } = route.params;

  const product = useProductStore((state) => state.getProductById(productId));
  const removeProduct = useProductStore((state) => state.removeProduct);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Produkt nie został znaleziony</Text>
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
    if (status === "expired") {
      return `Przeterminowany ${Math.abs(daysLeft)} dni temu`;
    } else if (daysLeft === 0) {
      return "Wygasa dzisiaj!";
    } else if (daysLeft === 1) {
      return "Wygasa jutro!";
    } else {
      return `Wygasa za ${daysLeft} dni`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
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
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Gramatura</Text>
            <Text style={styles.infoValue}>
              {product.weight > 0
                ? `${product.weight} ${product.weightUnit}`
                : `${product.quantity} szt`}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Kategoria</Text>
            <Text style={styles.infoValue}>{product.category}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Lokalizacja</Text>
            <Text style={styles.infoValue}>{product.location || "Nie określono"}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Dodano</Text>
            <Text style={styles.infoValue}>{formatDate(product.addedAt)}</Text>
          </View>
        </View>

        <View style={styles.expirySection}>
          <Text style={styles.expirySectionTitle}>Data ważności</Text>
          <Text style={styles.expiryDate}>{formatDate(product.expiryDate)}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.consumeButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={colors.white}
          />
          <Text style={styles.consumeButtonText}>Zjedzone / Zużyte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButtonBottom} activeOpacity={0.8}>
          <Text style={styles.editButtonText}>Edytuj</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral,
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
    color: colors.charcoal,
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
    color: colors.white,
    marginBottom: spacing.xs,
  },
  statusMessage: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.white,
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
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  infoLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.charcoal,
  },
  expirySection: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: "center",
    ...shadows.card,
  },
  expirySectionTitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  expiryDate: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.charcoal,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.gray,
  },
  bottomContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.neutral,
  },
  consumeButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.primary,
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
    color: colors.white,
  },
  editButtonBottom: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  editButtonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.charcoal,
  },
});
