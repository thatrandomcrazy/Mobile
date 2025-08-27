import React from "react";
import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../theme/ThemeProvider";

export default function PrimaryBtn({
  icon, label, onPress,
}: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 10, backgroundColor: colors.primary,
      }}
    >
      <Ionicons name={icon} size={16} color="#fff" />
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}
