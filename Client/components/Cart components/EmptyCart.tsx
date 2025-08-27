import React from "react";
import { View, Text } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";

export default function EmptyCart() {
  const { colors } = useAppTheme();
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 32 }}>
      <Text style={{ color: colors.muted }}>Your cart is empty</Text>
    </View>
  );
}
