import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../theme/ThemeProvider";

export default function SectionHeader({
  icon,
  title,
}: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
      <Ionicons name={icon} size={18} color={colors.text} />
      <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: "800", color: colors.text }}>{title}</Text>
    </View>
  );
}
