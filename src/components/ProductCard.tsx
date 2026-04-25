import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  radius,
  fontFamily,
  fontSize,
  spacing,
  shadows,
} from "../constants/theme";
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

export const ProductCard: React.FC<ProductCardProps> = memo(
  ({ product, onPress }) => {
    const status = getExpiryStatus(product.expiryDate);
    const statusColor = getStatusColor(status);
    const categoryIcon = getCategoryIcon(product.category);
    const categoryColor = getCategoryColor(product.category);

    const weightDisplay =
      product.weight > 0
        ? `${product.weight}${product.weightUnit}`
        : `${product.quantity} szt`;

    return (
      <TouchableOpacity
        style={styles.card}
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
              <View
                style={[
                  styles.iconPlaceholder,
                  { backgroundColor: `${categoryColor}20` },
                ]}
              >
                <Ionicons
                  name={categoryIcon}
                  size={24}
                  color={categoryColor}
                />
              </View>
            )}
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
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
    backgroundColor: colors.white,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    overflow: "hidden",
    ...shadows.card,
  },
  statusBorder: {
    width: 3,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  imageContainer: {
    marginRight: spacing.md,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
  },
  iconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.charcoal,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray,
  },
});
