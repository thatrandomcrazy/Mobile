import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";

interface Props {
  item: { id: string; title: string; price: number; image: string };
  onPress: () => void;
}

export default function ProductCard({ item, onPress }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.price}>₪{item.price}</Text>
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Details</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: { width: 100, height: 100, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: "bold" },
  price: { fontSize: 14, marginBottom: 8 },
  button: {
    backgroundColor: "tomato",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
