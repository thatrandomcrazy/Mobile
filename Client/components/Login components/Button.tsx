import React from "react";
import { Pressable, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";

export default function Button({
  text,
  onPress,
  variant = "primary",
  disabled,
  busy,
}: {
  text: string;
  onPress: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  busy?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      style={[
        s.btn,
        {
          backgroundColor: variant === "primary" ? colors.primary : "transparent",
          borderWidth: variant === "ghost" ? 1 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {busy ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : colors.text} />
      ) : (
        <Text style={[s.btnTxt, { color: variant === "primary" ? "#fff" : colors.text }]}>{text}</Text>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { paddingVertical: 14, borderRadius: 12, marginVertical: 6, alignItems: "center" },
  btnTxt: { fontWeight: "700", fontSize: 16 },
});
