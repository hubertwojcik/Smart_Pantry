import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
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
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ITEM_HEIGHT = 80;

export const PantryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const products = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);
  const getExpiringSoon = useProductStore((state) => state.getExpiringSoon);

  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("expiryDate");
  



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

  // Kaskada wejścia "z góry na dół": każdy element dostaje delay = pozycja * krok.
  const ENTER_STEP = 60;
  const ENTER_MAX = 8; // limit, by długie listy nie czekały zbyt długo

  const shownExpiring = sortedExpiringSoon.slice(0, 3);
  // Ile animowanych elementów jest w nagłówku — lista płynnie kontynuuje kaskadę.
  const headerCount =
    1 + // wiersz filtrów
    (shownExpiring.length > 0 ? 1 + shownExpiring.length : 0) + // tytuł + karty
    (remainingProducts.length > 0 ? 1 : 0); // tytuł "Pozostałe zapasy"
  const listBaseDelay = headerCount * ENTER_STEP;

  const renderProductCard = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(
          listBaseDelay + Math.min(index, ENTER_MAX) * ENTER_STEP,
        ).springify()}
      >
        <ProductCard product={item} onPress={() => handleProductPress(item.id)} />
      </Animated.View>
    ),
    [handleProductPress, listBaseDelay],
  );

  const renderHeader = () => (
    <View>
      <Animated.View
        style={styles.filterContainer}
        entering={FadeInDown.delay(0).springify()}
      >
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
      </Animated.View>

      {shownExpiring.length > 0 && (
        <View style={styles.section}>
          <Animated.View
            style={styles.sectionHeader}
            entering={FadeInDown.delay(ENTER_STEP).springify()}
          >
            <Text style={[styles.sectionTitle, { color: colors.gray }]}>
              WYGASAJĄCE WKRÓTCE
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                ZOBACZ WSZYSTKO
              </Text>
            </TouchableOpacity>
          </Animated.View>
          {shownExpiring.map((product, index) => (
            <Animated.View
              key={product.id}
              entering={FadeInDown.delay((2 + index) * ENTER_STEP).springify()}
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
        <Animated.View
          style={styles.sectionHeader}
          entering={FadeInDown.delay(
            (headerCount - 1) * ENTER_STEP,
          ).springify()}
        >
          <Text style={[styles.sectionTitle, { color: colors.gray }]}>
            {isGrouped ? "POZOSTAŁE ZAPASY" : "WSZYSTKIE PRODUKTY"}
          </Text>
        </Animated.View>
      )}
    </View>
  );

  // Produkty ładują się asynchronicznie z Firestore — pokaż loader zamiast
  // migać pustym stanem, dopóki nie dotrze pierwsza odpowiedź.
  if (isLoading && products.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.charcoal }]}>
            Inteligentna Spiżarnia
          </Text>
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (products.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.charcoal }]}>
            Inteligentna Spiżarnia
          </Text>
        </View>
        <EmptyState
          icon="basket-outline"
          iconColor={colors.primary}
          title="Spiżarnia jest pusta"
          subtitle="Dodaj swoje pierwsze produkty, aby śledzić ich daty ważności"
          actionLabel="Dodaj pierwszy produkt"
          onAction={() => navigation.navigate("AddProduct")}
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
        onPress={() => navigation.navigate("AddProduct")}
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    paddingBottom: spacing.lg,
    // justifyContent:'space-between'
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.elevated,
  },
});
