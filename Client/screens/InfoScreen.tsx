import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InfoScreen() {
  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  text: { marginLeft: 6, fontSize: 14, lineHeight: 18 },
});
