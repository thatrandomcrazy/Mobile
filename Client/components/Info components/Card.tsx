import React from "react";
import { View } from "react-native";

export default function Card({ colors, children }: { colors: any; children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        marginBottom: 12,
      }}
    >
      {children}
    </View>
  );
}
