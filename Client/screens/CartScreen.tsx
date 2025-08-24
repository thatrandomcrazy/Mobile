import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  Menu: { add: any | null };
  Cart: { items: CartItem[] };
  ProductDetails: { id: string; title: string; price: number; qty: number };
};

type CartItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
};

// 👇 שים פה את ה-IP של המחשב שלך או URL מ-ngrok
const BASE_URL = "http://192.168.1.29:5000";

export default function CartScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Cart">>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const items = route.params?.items || [];

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const submitOrder = async () => {
    if (items.length === 0) {
      Alert.alert("Cart is empty");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("You must log in first");
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items, total }),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Order placed successfully!");
        navigation.navigate("Menu", { add: null }); // clear cart
      } else {
        Alert.alert("Error", data.message || "Failed to place order");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>
              {item.title} x {item.qty}
            </Text>
            <Text>₪{item.price * item.qty}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Your cart is empty</Text>}
      />
      <Text style={styles.total}>Total: ₪{total}</Text>
      <Pressable
        style={[styles.clearButton, { backgroundColor: "tomato" }]}
        onPress={submitOrder}
        disabled={loading}
      >
        <Text style={{ color: "#fff" }}>
          {loading ? "Submitting..." : "Place Order"}
        </Text>
      </Pressable>
      <Pressable
        style={[styles.clearButton, { backgroundColor: "#999", marginTop: 8 }]}
        onPress={() => navigation.navigate("Menu", { add: null })}
      >
        <Text style={{ color: "#fff" }}>Clear All</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  total: { fontSize: 18, fontWeight: "bold", marginVertical: 16 },
  clearButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
