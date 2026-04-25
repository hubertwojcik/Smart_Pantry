import React from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontFamily, fontSize, shadows } from "../constants/theme";
import { useNotificationStore } from "../store/notificationStore";

import { PantryScreen } from "../screens/PantryScreen";
import { AddProductScreen } from "../screens/AddProductScreen";
import { AlertsScreen } from "../screens/AlertsScreen";
import { ProductDetailScreen } from "../screens/ProductDetailScreen";
import { BarcodeScannerScreen } from "../screens/BarcodeScannerScreen";

export type RootStackParamList = {
  MainTabs: undefined;
  ProductDetail: { productId: string };
  BarcodeScanner: undefined;
};

export type TabParamList = {
  PantryTab: undefined;
  AddTab: undefined;
  AlertsTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          ...shadows.elevated,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarLabelStyle: {
          fontFamily: fontFamily.medium,
          fontSize: fontSize.xs,
        },
      }}
    >
      <Tab.Screen
        name="PantryTab"
        component={PantryScreen}
        options={{
          tabBarLabel: "ZAPASY",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="file-tray-full-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={AddProductScreen}
        options={{
          tabBarLabel: "DODAJ",
          tabBarIcon: ({ focused }) => (
            <View style={styles.addButton}>
              <Ionicons name="add" size={28} color={colors.white} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AlertsTab"
        component={AlertsScreen}
        options={{
          tabBarLabel: "ALERTY",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.statusRed,
            fontSize: 10,
            minWidth: 18,
            height: 18,
          },
        }}
      />
    </Tab.Navigator>
  );
};

export const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.neutral },
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="BarcodeScanner"
          component={BarcodeScannerScreen}
          options={{
            animation: "slide_from_bottom",
            presentation: "fullScreenModal",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    ...shadows.elevated,
  },
});
