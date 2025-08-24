import React, { useState } from "react";
import { View, Text, Image, StyleSheet, Pressable, Modal } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Menu: { add: { id: any; title: any; price: any; qty: number } | null };
  Cart: { items: any[] };
  ProductDetails: { id: any; title: any; price: any; image: string };
};

type ProductDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProductDetails"
>;
type ProductDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  "ProductDetails"
>;

export default function ProductDetailsScreen() {
  const navigation = useNavigation<ProductDetailsScreenNavigationProp>();
  const route = useRoute<ProductDetailsScreenRouteProp>();
  const { id, title, price, image } = route.params;

  const [qty, setQty] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  const addToCart = () => {
    navigation.navigate("Menu", { add: { id, title, price, qty } });
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 2000);
  };

  return (
    <View style={{ flex: 1, alignItems: "center", padding: 16 }}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>₪{price}</Text>
      <Text style={styles.description}>Delicious burger/junk food item.</Text>
      <View style={styles.qtyContainer}>
        <Pressable
          onPress={() => setQty((q) => Math.max(1, q - 1))}
          style={styles.qtyButton}
        >
          <Text>-</Text>
        </Pressable>
        <Text style={styles.qtyText}>{qty}</Text>
        <Pressable
          onPress={() => setQty((q) => q + 1)}
          style={styles.qtyButton}
        >
          <Text>+</Text>
        </Pressable>
      </View>
      <Pressable onPress={addToCart} style={styles.addButton}>
        <Text style={{ color: "#fff" }}>Add to Cart</Text>
      </Pressable>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modal}>
          <Text style={{ color: "#fff" }}>✓ Added to cart</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: 200, height: 200, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "bold" },
  price: { fontSize: 18, marginBottom: 8 },
  description: { fontSize: 14, marginBottom: 16 },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  qtyButton: { borderWidth: 1, borderColor: "#ccc", padding: 8 },
  qtyText: { marginHorizontal: 16, fontSize: 16 },
  addButton: { backgroundColor: "tomato", padding: 12, borderRadius: 8 },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000080",
  },
});
