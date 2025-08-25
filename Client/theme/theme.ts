// src/theme/theme.ts
import { DarkTheme as NavDark, DefaultTheme as NavLight, Theme as NavTheme } from "@react-navigation/native";

export type Colors = {
  background: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  danger: string;
  success: string;
};

export const lightColors: Colors = {
  background: "#ffffff",
  card: "#ffffff",
  text: "#111111",
  muted: "#6b7280",
  border: "#e5e7eb",
  primary: "tomato",
  danger: "#dc2626",
  success: "#16a34a",
};

export const darkColors: Colors = {
  background: "#0b0b0b",
  card: "#101214",
  text: "#f3f4f6",
  muted: "#9ca3af",
  border: "#1f2937",
  primary: "tomato",
  danger: "#f87171",
  success: "#34d399",
};

export const navLight: NavTheme = {
  ...NavLight,
  colors: {
    ...NavLight.colors,
    background: lightColors.background,
    card: lightColors.card,
    text: lightColors.text,
    border: lightColors.border,
    primary: lightColors.primary,
  },
};

export const navDark: NavTheme = {
  ...NavDark,
  colors: {
    ...NavDark.colors,
    background: darkColors.background,
    card: darkColors.card,
    text: darkColors.text,
    border: darkColors.border,
    primary: darkColors.primary,
  },
};
