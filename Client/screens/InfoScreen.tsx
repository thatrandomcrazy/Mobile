// src/screens/InfoScreen.tsx
import React from "react";
import { View, Text, StyleSheet, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function InfoScreen() {
  const insets = useSafeAreaInsets();
  const topPad =
    (insets.top || (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0)) + 4;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.row}>
          <Ionicons name="home" size={16} />
          <Text style={styles.text}>Burger House</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="time" size={16} />
          <Text style={styles.text}>Open 10:00 - 22:00</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="location" size={16} />
          <Text style={styles.text}>123 Burger St, Tel Aviv</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="call" size={16} />
          <Text style={styles.text}>+972-50-1234567</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 12 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  text: { marginLeft: 6, fontSize: 14, lineHeight: 18 },
});
