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
import { Category, CATEGORIES } from "../types";

interface CategoryPickerProps {
  value: Category | null;
  onChange: (category: Category) => void;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onChange,
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (category: Category) => {
    onChange(category);
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
          <Text style={[styles.label, { color: colors.gray }]}>Kategoria</Text>
          <Text
            style={[
              styles.value,
              { color: value ? colors.charcoal : colors.gray },
            ]}
          >
            {value || "Wybierz kategorię"}
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
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <SafeAreaView>
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.modalTitle, { color: colors.charcoal }]}>
                  Wybierz kategorię
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={colors.charcoal} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={CATEGORIES}
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
    maxHeight: "60%",
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
  optionText: {
    fontSize: fontSize.md,
  },
});
