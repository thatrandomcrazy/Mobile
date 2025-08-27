import React from "react";
import { Pressable, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";

export default function PrimaryButton({
  text,
  onPress,
  loading,
  disabled,
}: {
  text: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      style={[
        s.btn,
        { backgroundColor: isDisabled ? colors.border : colors.primary },
      ]}
      onPress={onPress}
    >
      {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.txt}>{text}</Text>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 10 },
  txt: { color: "#fff", fontWeight: "700" },
});
