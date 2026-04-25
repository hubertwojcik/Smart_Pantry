import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, fontFamily, fontSize, spacing } from "../constants/theme";
import { LOCATIONS, Location } from "../types";

interface LocationPickerProps {
  value: string | null;
  onChange: (location: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (location: string) => {
    onChange(location);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Lokalizacja</Text>
          <Text style={[styles.value, !value && styles.placeholder]}>
            {value || "Wybierz lokalizację"}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.gray} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SafeAreaView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Wybierz lokalizację</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={colors.charcoal} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={LOCATIONS}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      value === item && styles.optionSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.optionContent}>
                      <Ionicons
                        name={getLocationIcon(item)}
                        size={20}
                        color={value === item ? colors.primary : colors.gray}
                        style={styles.optionIcon}
                      />
                      <Text
                        style={[
                          styles.optionText,
                          value === item && styles.optionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                    {value === item && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const getLocationIcon = (location: string): keyof typeof Ionicons.glyphMap => {
  switch (location) {
    case "Lodówka":
      return "snow-outline";
    case "Spiżarnia":
      return "file-tray-stacked-outline";
    case "Szafka":
      return "cube-outline";
    case "Zamrażarka":
      return "thermometer-outline";
    default:
      return "location-outline";
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.gray,
    marginBottom: 2,
  },
  value: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.charcoal,
  },
  placeholder: {
    color: colors.gray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    color: colors.charcoal,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIcon: {
    marginRight: spacing.md,
  },
  optionText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.charcoal,
  },
  optionTextSelected: {
    fontFamily: fontFamily.semiBold,
    color: colors.primary,
  },
});
