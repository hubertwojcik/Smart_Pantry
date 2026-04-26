import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  fontFamily,
  fontSize,
  spacing,
  radius,
  shadows,
} from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useProductStore } from "../store/productStore";
import { Category } from "../types";
import {
  FloatingInput,
  UnitToggle,
  QuantityStepper,
  CategoryPicker,
  LocationPicker,
} from "../components";
import { RootStackParamList } from "../navigation";
import { FoodFactsResult } from "../services/openFoodFacts";
import { runExpiryCheckForeground } from "../services/notificationService";
import { formatDate } from "../services/expiryService";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AddProductScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const addProduct = useProductStore((state) => state.addProduct);
  const products = useProductStore((state) => state.products);

  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"g" | "ml" | "szt">("g");
  const [category, setCategory] = useState<Category | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [scannedData, setScannedData] = useState<FoodFactsResult | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [location, setLocation] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(formFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (showSuccessBanner && !expiryDate) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [showSuccessBanner, expiryDate]);

  const isValid = name.trim() !== "" && expiryDate !== null;

  const handleScanPress = () => {
    navigation.navigate("BarcodeScanner");
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!isValid || !expiryDate) return;

    addProduct({
      name: name.trim(),
      weight: parseFloat(weight) || 0,
      weightUnit,
      category: category || "Inne",
      expiryDate: expiryDate.toISOString(),
      quantity,
      location: location || undefined,
      barcode: scannedData?.barcode,
      imageUrl: scannedData?.imageUrl || undefined,
    });

    await runExpiryCheckForeground([
      ...products,
      {
        id: "temp",
        name: name.trim(),
        weight: parseFloat(weight) || 0,
        weightUnit,
        category: category || "Inne",
        expiryDate: expiryDate.toISOString(),
        quantity,
        addedAt: new Date().toISOString(),
      },
    ]);

    Alert.alert("Sukces", "Produkt został dodany do spiżarni", [
      {
        text: "OK",
        onPress: () => {
          resetForm();
          navigation.goBack();
        },
      },
    ]);
  };

  const resetForm = () => {
    setName("");
    setWeight("");
    setWeightUnit("g");
    setCategory(null);
    setLocation(null);
    setExpiryDate(null);
    setQuantity(1);
    setScannedData(null);
    setShowSuccessBanner(false);
  };

  const handleBarcodeResult = useCallback((result: FoodFactsResult) => {
    setScannedData(result);
    setName(result.name);
    if (result.weight) {
      setWeight(result.weight.toString());
    }
    setWeightUnit(result.weightUnit);
    setCategory(result.category);
    setShowSuccessBanner(true);
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.charcoal }]}>
          Dodaj produkt
        </Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isValid}
          style={styles.checkButton}
        >
          <Ionicons
            name="checkmark"
            size={24}
            color={isValid ? colors.primary : colors.border}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {showSuccessBanner && (
            <View
              style={[
                styles.successBanner,
                { backgroundColor: `${colors.statusGreen}15` },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.statusGreen}
              />
              <Text style={[styles.successText, { color: colors.statusGreen }]}>
                Produkt rozpoznany — uzupełnij datę ważności
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.scanCard,
              {
                backgroundColor: colors.surface,
                borderLeftColor: colors.primary,
              },
            ]}
            onPress={handleScanPress}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.scanIconContainer,
                { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <Ionicons
                name="barcode-outline"
                size={32}
                color={colors.primary}
              />
            </View>
            <View style={styles.scanTextContainer}>
              <Text style={[styles.scanTitle, { color: colors.charcoal }]}>
                Zeskanuj kod kreskowy
              </Text>
              <Text style={[styles.scanSubtitle, { color: colors.gray }]}>
                Uzupełnimy dane automatycznie
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
            <Text style={[styles.dividerText, { color: colors.gray }]}>
              LUB WPISZ RĘCZNIE
            </Text>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
          </View>

          <Animated.View style={{ opacity: formFadeAnim }}>
            <FloatingInput
              label="Nazwa produktu"
              value={name}
              onChangeText={setName}
              required
            />

            <View style={styles.weightRow}>
              <View style={styles.weightInput}>
                <FloatingInput
                  label="Gramatura / ilość"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>
              <UnitToggle value={weightUnit} onChange={setWeightUnit} />
            </View>

            <CategoryPicker value={category} onChange={setCategory} />

            <LocationPicker value={location} onChange={setLocation} />

            <Animated.View style={{ opacity: pulseAnim }}>
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.primary,
                  },
                  showSuccessBanner &&
                    !expiryDate &&
                    styles.datePickerHighlight,
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <View>
                  <Text style={[styles.dateLabel, { color: colors.primary }]}>
                    Data ważności *
                  </Text>
                  <Text
                    style={[
                      styles.dateValue,
                      { color: expiryDate ? colors.charcoal : colors.gray },
                    ]}
                  >
                    {expiryDate
                      ? formatDate(expiryDate.toISOString())
                      : "mm/dd/yyyy"}
                  </Text>
                </View>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.gray}
                />
              </TouchableOpacity>
            </Animated.View>

            {showDatePicker && (
              <DateTimePicker
                value={expiryDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            <View
              style={[
                styles.quantityRow,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.quantityLabel, { color: colors.charcoal }]}>
                Ilość sztuk
              </Text>
              <QuantityStepper value={quantity} onChange={setQuantity} />
            </View>
          </Animated.View>
        </ScrollView>

        <View
          style={[
            styles.bottomContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: isValid ? colors.primary : colors.border },
            ]}
            onPress={handleSubmit}
            disabled={!isValid}
            activeOpacity={0.8}
          >
            <Text style={[styles.submitButtonText, { color: colors.white }]}>
              Dodaj do spiżarni
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
  },
  checkButton: {
    padding: spacing.sm,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  successText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
    flex: 1,
  },
  scanCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    padding: spacing.lg,
    borderLeftWidth: 4,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  scanIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  scanTextContainer: {
    flex: 1,
  },
  scanTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    marginBottom: 2,
  },
  scanSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    marginHorizontal: spacing.md,
    letterSpacing: 0.5,
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  weightInput: {
    flex: 1,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  datePickerHighlight: {
    borderWidth: 2,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dateLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  dateValue: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  quantityLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
  },
  bottomContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  submitButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    ...shadows.card,
  },
  submitButtonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
  },
});
