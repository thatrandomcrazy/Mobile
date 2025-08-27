import React, { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../theme/ThemeProvider";

type Props = { onPress: () => void };

export default function FAB({ onPress }: Props) {
  const { colors } = useAppTheme();
  const s = useMemo(() => styles(colors), [colors]);
  return (
    <Pressable style={s.fab} onPress={onPress}>
      <Ionicons name="add" size={28} color="#fff" />
    </Pressable>
  );
}

const styles = (c: any) =>
  StyleSheet.create({
    fab: {
      position: "absolute",
      right: 16,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
  });
