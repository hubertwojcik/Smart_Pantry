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
  colors,
  fontFamily,
  fontSize,
  spacing,
  radius,
  shadows,
} from "../constants/theme";
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
      { text: "OK", onPress: () => resetForm() },
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dodaj produkt</Text>
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
            <View style={styles.successBanner}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.statusGreen}
              />
              <Text style={styles.successText}>
                Produkt rozpoznany — uzupełnij datę ważności
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.scanCard}
            onPress={handleScanPress}
            activeOpacity={0.7}
          >
            <View style={styles.scanIconContainer}>
              <Ionicons
                name="barcode-outline"
                size={32}
                color={colors.primary}
              />
            </View>
            <View style={styles.scanTextContainer}>
              <Text style={styles.scanTitle}>Zeskanuj kod kreskowy</Text>
              <Text style={styles.scanSubtitle}>
                Uzupełnimy dane automatycznie
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>LUB WPISZ RĘCZNIE</Text>
            <View style={styles.dividerLine} />
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
                  showSuccessBanner &&
                    !expiryDate &&
                    styles.datePickerHighlight,
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <View>
                  <Text style={styles.dateLabel}>Data ważności *</Text>
                  <Text
                    style={[
                      styles.dateValue,
                      !expiryDate && styles.datePlaceholder,
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

            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>Ilość sztuk</Text>
              <QuantityStepper value={quantity} onChange={setQuantity} />
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isValid && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isValid}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Dodaj do spiżarni</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    color: colors.charcoal,
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
    backgroundColor: `${colors.statusGreen}15`,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  successText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.statusGreen,
    marginLeft: spacing.sm,
    flex: 1,
  },
  scanCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  scanIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: `${colors.primary}15`,
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
    color: colors.charcoal,
    marginBottom: 2,
  },
  scanSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.gray,
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
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  datePickerHighlight: {
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dateLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.primary,
    marginBottom: 2,
  },
  dateValue: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.charcoal,
  },
  datePlaceholder: {
    color: colors.gray,
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  quantityLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.charcoal,
  },
  bottomContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.neutral,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    ...shadows.card,
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.white,
  },
});
