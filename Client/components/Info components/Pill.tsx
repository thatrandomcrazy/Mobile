import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Pill({
  icon, label, color,
}: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: 6,
      paddingHorizontal: 12, paddingVertical: 6,
      borderRadius: 999, backgroundColor: color,
    }}>
      <Ionicons name={icon} size={14} color="#fff" />
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>{label}</Text>
    </View>
  );
}
