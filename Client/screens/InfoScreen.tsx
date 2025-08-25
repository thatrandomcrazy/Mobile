// src/screens/InfoScreen.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";

export default function InfoScreen() {
  const { colors } = useAppTheme();
  const s = styles(colors);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.container}>
        <View style={s.row}>
          <Ionicons name="home" size={16} color={colors.text} />
          <Text style={s.text}>Burger House</Text>
        </View>
        <View style={s.row}>
          <Ionicons name="time" size={16} color={colors.text} />
          <Text style={s.text}>Open 10:00 - 22:00</Text>
        </View>
        <View style={s.row}>
          <Ionicons name="location" size={16} color={colors.text} />
          <Text style={s.text}>123 Burger St, Tel Aviv</Text>
        </View>
        <View style={s.row}>
          <Ionicons name="call" size={16} color={colors.text} />
          <Text style={s.text}>+972-50-1234567</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = (c: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    container: { flex: 1, paddingHorizontal: 12, paddingTop: 4 },
    row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    text: { marginLeft: 6, fontSize: 14, lineHeight: 18, color: c.text },
  });
