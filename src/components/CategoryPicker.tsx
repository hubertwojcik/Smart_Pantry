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
import { colors, radius, fontFamily, fontSize, spacing, shadows } from "../constants/theme";
import { Category, CATEGORIES } from "../types";

interface CategoryPickerProps {
  value: Category | null;
  onChange: (category: Category) => void;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (category: Category) => {
    onChange(category);
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
          <Text style={styles.label}>Kategoria</Text>
          <Text style={[styles.value, !value && styles.placeholder]}>
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
          <View style={styles.modalContent}>
            <SafeAreaView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Wybierz kategorię</Text>
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
                      value === item && styles.optionSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        value === item && styles.optionTextSelected,
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
    maxHeight: "60%",
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
