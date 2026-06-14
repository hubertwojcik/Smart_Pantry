import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, fontFamily, fontSize, spacing, shadows } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { Product, Category } from "../types";
import { StatusBadge } from "./StatusBadge";
import { getStatusColor, getExpiryStatus } from "../services/expiryService";

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

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

export const ProductCard: React.FC<ProductCardProps> = memo(
  ({ product, onPress }) => {
    const { colors, isDark } = useTheme();
    const status = getExpiryStatus(product.expiryDate);
    const statusColor = getStatusColor(status);
    const categoryIcon = getCategoryIcon(product.category);

    const weightDisplay =
      product.weight > 0
        ? `${product.weight}${product.weightUnit}`
        : `${product.quantity} szt`;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }, isDark && styles.cardDark]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.statusBorder, { backgroundColor: statusColor }]} />
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            {product.imageUrl ? (
              <Image
                source={{ uri: product.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              // Bez tła — sama ikona wybarwiona kolorem statusu (jak w makiecie).
              <Ionicons name={categoryIcon} size={30} color={statusColor} />
            )}
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.charcoal }]} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={[styles.subtitle, { color: colors.gray }]} numberOfLines={1}>
              {product.location && `${product.location} • `}
              {weightDisplay}
            </Text>
          </View>
          <StatusBadge expiryDate={product.expiryDate} size="small" />
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    overflow: "hidden",
    ...shadows.card,
  },
  cardDark: {
    shadowOpacity: 0,
    elevation: 0,
  },
  statusBorder: {
    width: 3,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
  },
  imageContainer: {
    width: 48,
    height: 48,
    marginRight: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
});
