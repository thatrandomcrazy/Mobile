import React from "react";
import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../theme/ThemeProvider";

export default function ActionBtn({
  icon, label, onPress,
}: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 10, borderWidth: 1,
        borderColor: colors.border, backgroundColor: colors.card,
      }}
    >
      <Ionicons name={icon} size={16} color={colors.text} />
      <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}
