import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { fontFamily, fontSize, spacing, shadows } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useProductStore } from "../store/productStore";
import { Product, SortOption } from "../types";
import { ProductCard, FilterChip, EmptyState } from "../components";
import { RootStackParamList } from "../navigation";
import { runExpiryCheckForeground } from "../services/notificationService";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ITEM_HEIGHT = 80;

export const PantryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const products = useProductStore((state) => state.products);
  const getExpiringSoon = useProductStore((state) => state.getExpiringSoon);

  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("expiryDate");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const expiringSoon = getExpiringSoon();

  const sortProducts = useCallback(
    (list: Product[]) => {
      const sorted = [...list];
      switch (sortBy) {
        case "name":
          return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case "category":
          return sorted.sort((a, b) => a.category.localeCompare(b.category));
        case "expiryDate":
        default:
          return sorted.sort(
            (a, b) =>
              new Date(a.expiryDate).getTime() -
              new Date(b.expiryDate).getTime(),
          );
      }
    },
    [sortBy],
  );

  // When sorting by name or category show all products together without
  // the expiring-soon split (otherwise products already in the header
  // disappear from the list and sorting looks broken).
  const isGrouped = sortBy === "expiryDate";

  const sortedExpiringSoon = isGrouped ? expiringSoon : [];
  const remainingProducts = isGrouped
    ? sortProducts(
        products.filter((p) => !expiringSoon.find((e) => e.id === p.id)),
      )
    : sortProducts(products);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await runExpiryCheckForeground(products);
    setRefreshing(false);
  }, [products]);

  const handleProductPress = useCallback(
    (productId: string) => {
      navigation.navigate("ProductDetail", { productId });
    },
    [navigation],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const renderProductCard = useCallback(
    ({ item }: { item: Product }) => (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <ProductCard
          product={item}
          onPress={() => handleProductPress(item.id)}
        />
      </Animated.View>
    ),
    [fadeAnim, handleProductPress],
  );

  const renderHeader = () => (
    <View>
      <View style={styles.filterContainer}>
        <FilterChip
          label="Data ważności"
          active={sortBy === "expiryDate"}
          onPress={() => setSortBy("expiryDate")}
        />
        <FilterChip
          label="Nazwa"
          active={sortBy === "name"}
          onPress={() => setSortBy("name")}
        />
        <FilterChip
          label="Kategoria"
          active={sortBy === "category"}
          onPress={() => setSortBy("category")}
        />
      </View>

      {sortedExpiringSoon.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.gray }]}>
              WYGASAJĄCE WKRÓTCE
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                ZOBACZ WSZYSTKO
              </Text>
            </TouchableOpacity>
          </View>
          {sortedExpiringSoon.slice(0, 3).map((product, index) => (
            <Animated.View
              key={product.id}
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20 * (index + 1), 0],
                    }),
                  },
                ],
              }}
            >
              <ProductCard
                product={product}
                onPress={() => handleProductPress(product.id)}
              />
            </Animated.View>
          ))}
        </View>
      )}

      {remainingProducts.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.gray }]}>
            {isGrouped ? "POZOSTAŁE ZAPASY" : "WSZYSTKIE PRODUKTY"}
          </Text>
        </View>
      )}
    </View>
  );

  if (products.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.charcoal }]}>
            Inteligentna Spiżarnia
          </Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="search-outline"
                size={24}
                color={colors.charcoal}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Settings")}
            >
              <Ionicons
                name="person-circle-outline"
                size={24}
                color={colors.charcoal}
              />
            </TouchableOpacity>
          </View>
        </View>
        <EmptyState
          icon="basket-outline"
          iconColor={colors.primary}
          title="Spiżarnia jest pusta"
          subtitle="Dodaj swoje pierwsze produkty, aby śledzić ich daty ważności"
          actionLabel="Dodaj pierwszy produkt"
          onAction={() =>
            navigation.navigate("MainTabs", { screen: "AddTab" } as any)
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.charcoal }]}>
          Inteligentna Spiżarnia
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color={colors.charcoal} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons
              name="person-circle-outline"
              size={24}
              color={colors.charcoal}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={remainingProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProductCard}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        getItemLayout={getItemLayout}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() =>
          navigation.navigate("MainTabs", { screen: "AddTab" } as any)
        }
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
  },
  seeAll: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  fab: {
    position: "absolute",
    right: spacing.xl,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.elevated,
  },
});
