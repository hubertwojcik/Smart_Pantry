export type ThemeColors = {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  surface: string;
  neutral: string;
  white: string;
  charcoal: string;
  gray: string;
  border: string;
  statusRed: string;
  statusAmber: string;
  statusGreen: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  tabBarBg: string;
  tabBarBorder: string;
};

export const lightColors: ThemeColors = {
  primary: "#F97316",
  secondary: "#4ADE80",
  tertiary: "#F59E0B",
  background: "#FAFAF9",
  surface: "#FFFFFF",
  neutral: "#FAFAF9",
  white: "#FFFFFF",
  charcoal: "#1C1917",
  gray: "#78716C",
  border: "#E5E3DF",
  statusRed: "#EF4444",
  statusAmber: "#F59E0B",
  statusGreen: "#4ADE80",
  surfaceContainerLow: "#F5F5F4",
  surfaceContainerHigh: "#E7E5E4",
  tabBarBg: "#FFFFFF",
  tabBarBorder: "transparent",
};

export const darkColors: ThemeColors = {
  primary: "#F97316",
  secondary: "#4ADE80",
  tertiary: "#F59E0B",
  background: "#0C0A09",
  surface: "#1C1917",
  neutral: "#0C0A09",
  white: "#FFFFFF",
  charcoal: "#F5F5F4",
  gray: "#A8A29E",
  border: "#292524",
  statusRed: "#F87171",
  statusAmber: "#FCD34D",
  statusGreen: "#4ADE80",
  surfaceContainerLow: "#1C1917",
  surfaceContainerHigh: "#292524",
  tabBarBg: "rgba(12, 10, 9, 0.97)",
  tabBarBorder: "#292524",
};

export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const fontFamily = {
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semiBold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
};

export const fontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  display: 32,
};

export const shadows = {
  card: {
    shadowColor: "#1C1917",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  elevated: {
    shadowColor: "#1C1917",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
};
