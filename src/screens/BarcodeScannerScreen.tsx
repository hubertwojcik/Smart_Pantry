import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, fontFamily, fontSize, spacing, radius } from "../constants/theme";
import { RootStackParamList } from "../navigation";
import { fetchProductByBarcode, FoodFactsResult } from "../services/openFoodFacts";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get("window");
const SCAN_AREA_SIZE = width * 0.7;

export const BarcodeScannerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const productData = await fetchProductByBarcode(result.data);

      if (productData) {
        navigation.goBack();
        setTimeout(() => {
          navigation.navigate("MainTabs", {
            screen: "AddTab",
            params: { scannedProduct: productData },
          } as any);
        }, 100);
      } else {
        Alert.alert(
          "Nie znaleziono produktu",
          "Nie znaleziono produktu w bazie danych. Wpisz dane ręcznie.",
          [
            {
              text: "OK",
              onPress: () => {
                setScanned(false);
                setLoading(false);
                navigation.goBack();
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Błąd", "Wystąpił błąd podczas skanowania. Spróbuj ponownie.", [
        {
          text: "OK",
          onPress: () => {
            setScanned(false);
            setLoading(false);
          },
        },
      ]);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Wymagany dostęp do kamery</Text>
        <Text style={styles.permissionText}>
          Aby skanować kody kreskowe, aplikacja potrzebuje dostępu do kamery.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Zezwól na dostęp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButtonPermission}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonTextPermission}>Anuluj</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 4],
  });

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code128",
            "code39",
            "code93",
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanLineTranslateY }] },
              ]}
            />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>
          <Text style={styles.instructionText}>
            Skieruj aparat na kod kreskowy
          </Text>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.loadingText}>Wyszukiwanie produktu...</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Anuluj</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.neutral,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
  },
  permissionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.charcoal,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  permissionText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.gray,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.md,
  },
  permissionButtonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.white,
  },
  cancelButtonPermission: {
    paddingVertical: spacing.md,
  },
  cancelButtonTextPermission: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.gray,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  overlayMiddle: {
    flexDirection: "row",
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: colors.primary,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    paddingTop: spacing.xxl,
  },
  instructionText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.white,
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  loadingText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  cancelButtonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.white,
  },
});
