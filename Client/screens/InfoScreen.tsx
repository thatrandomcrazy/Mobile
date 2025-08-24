import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InfoScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={styles.row}>
        <Ionicons name="home" size={20} />
        <Text style={styles.text}>Burger House</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="time" size={20} />
        <Text style={styles.text}>Open 10:00 - 22:00</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="location" size={20} />
        <Text style={styles.text}>123 Burger St, Tel Aviv</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="call" size={20} />
        <Text style={styles.text}>+972-50-1234567</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  text: { marginLeft: 8, fontSize: 16 },
});
