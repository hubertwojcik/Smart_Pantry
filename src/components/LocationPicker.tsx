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
import { radius, fontFamily, fontSize, spacing } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { LOCATIONS } from "../types";

interface LocationPickerProps {
  value: string | null;
  onChange: (location: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (location: string) => {
    onChange(location);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: colors.surfaceContainerLow,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.gray }]}>
            Lokalizacja
          </Text>
          <Text
            style={[
              styles.value,
              { color: value ? colors.charcoal : colors.gray },
            ]}
          >
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
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <SafeAreaView>
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.modalTitle, { color: colors.charcoal }]}>
                  Wybierz lokalizację
                </Text>
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
                      { borderBottomColor: colors.border },
                      value === item && {
                        backgroundColor: `${colors.primary}10`,
                      },
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
                          {
                            color:
                              value === item ? colors.primary : colors.charcoal,
                            fontFamily:
                              value === item
                                ? fontFamily.semiBold
                                : fontFamily.regular,
                          },
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
    borderRadius: radius.md,
    borderWidth: 1,
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
    marginBottom: 2,
  },
  value: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
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
  },
  modalTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIcon: {
    marginRight: spacing.md,
  },
  optionText: {
    fontSize: fontSize.md,
  },
});
