import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../theme/ThemeProvider";

export default function QuantityControl({
  onDec, onInc, canDec, canInc,
}: {
  onDec: () => void;
  onInc: () => void;
  canDec: boolean;
  canInc: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={s.wrap}>
      <Pressable
        style={[s.qtyBtn, { backgroundColor: canDec ? colors.primary : colors.muted }]}
        onPress={onDec}
        disabled={!canDec}
      >
        <Ionicons name="remove" size={16} color="#fff" />
      </Pressable>

      <Text style={[s.qtyText, { color: colors.text }]}>{/* יוצג ע"י ההורה */}</Text>

      <Pressable
        style={[s.qtyBtn, { backgroundColor: canInc ? colors.primary : colors.muted }]}
        onPress={onInc}
        disabled={!canInc}
      >
        <Ionicons name="add" size={16} color="#fff" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  qtyText: { minWidth: 0 }, // לא בשימוש כאן (הטקסט של הכמות מוצג בשורה של הפריט)
});
