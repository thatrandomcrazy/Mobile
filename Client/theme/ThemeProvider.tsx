// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, darkColors, lightColors, navDark, navLight } from "./theme";
import type { Theme as NavTheme } from "@react-navigation/native";

type Mode = "system" | "light" | "dark";

type ThemeCtx = {
  colors: Colors;
  navTheme: NavTheme;
  mode: Mode;
  setMode: (m: Mode) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeCtx | null>(null);
const KEY = "theme.mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setMode] = useState<Mode>("system");

  // load saved mode
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(KEY);
      if (saved === "light" || saved === "dark" || saved === "system") {
        setMode(saved);
      }
    })();
  }, []);

  // persist mode
  useEffect(() => {
    AsyncStorage.setItem(KEY, mode).catch(() => {});
  }, [mode]);

  const effective: "light" | "dark" = mode === "system" ? (system ?? "light") : mode;
  const isDark = effective === "dark";

  const value = useMemo<ThemeCtx>(() => {
    const colors = isDark ? darkColors : lightColors;
    const navTheme = isDark ? navDark : navLight;
    return { colors, navTheme, mode, setMode, isDark };
  }, [isDark, mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within ThemeProvider");
  return ctx;
}
