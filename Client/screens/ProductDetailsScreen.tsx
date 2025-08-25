import React, { useMemo, useState } from "react";
import { View, Text, Image, StyleSheet, Pressable, Modal } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { addToCart } from "../utils/cartStorage";

type RootStackParamList = {
  MainTabs: { screen: "Menu"; params?: any };
  ProductDetails: { id: string; title: string; price: number; image: string; inventory: number };
};

type Nav = NativeStackNavigationProp<RootStackParamList, "ProductDetails">;
type Rt  = RouteProp<RootStackParamList, "ProductDetails">;

export default function ProductDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { id, title, price, image, inventory } = route.params;

  const safeInventory = useMemo(
    () => Math.max(0, Number.isFinite(inventory) ? inventory : 0),
    [inventory]
  );
  const isOutOfStock = safeInventory === 0;
  const lowStock = !isOutOfStock && safeInventory <= 4;

  const [qty, setQty] = useState(() => (isOutOfStock ? 0 : 1));
  const [modalVisible, setModalVisible] = useState(false);
  const [adding, setAdding] = useState(false);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(safeInventory, q + 1));

  const addHandler = async () => {
    if (adding || isOutOfStock || qty <= 0) return;
    setAdding(true);

    // שומר ישירות בעגלה המקומית (AsyncStorage)
    await addToCart({ id, title, price, qty, image, inventory: safeInventory });

    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
      setAdding(false);
      // אם תרצה לחזור מיד לתפריט אחרי הוספה:
      // navigation.navigate("MainTabs", { screen: "Menu" });
    }, 750);
  };

  return (
    <View style={styles.wrap}>
      <Image
        source={{ uri: image || "https://via.placeholder.com/300x300?text=No+Image" }}
        style={styles.image}
      />

      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.price}>₪{price.toFixed ? price.toFixed(2) : price}</Text>

      {isOutOfStock ? (
        <View style={styles.oosChip}><Text style={styles.oosText}>Out of stock</Text></View>
      ) : (
        <View style={styles.stockRow}>
          <Text style={styles.stockText}>Available: {safeInventory}</Text>
          {lowStock && <Text style={styles.lowStock}>Low stock</Text>}
        </View>
      )}

      <View style={[styles.qtyContainer, isOutOfStock && { opacity: 0.5 }]}>
        <Pressable
          onPress={dec}
          style={[styles.qtyBtn, qty <= 1 && styles.qtyBtnDisabled]}
          disabled={isOutOfStock || qty <= 1}
          accessibilityLabel="Decrease quantity"
        >
          <Text style={styles.qtyBtnText}>−</Text>
        </Pressable>

        <Text style={styles.qtyText}>{qty}</Text>

        <Pressable
          onPress={inc}
          style={[styles.qtyBtn, qty >= safeInventory && styles.qtyBtnDisabled]}
          disabled={isOutOfStock || qty >= safeInventory}
          accessibilityLabel="Increase quantity"
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </Pressable>
      </View>

      {!isOutOfStock ? (
        <Pressable
          onPress={addHandler}
          style={[styles.addButton, adding && { opacity: 0.85 }]}
          disabled={adding}
          accessibilityLabel="Add to cart"
        >
          <Text style={styles.addButtonText}>
            {adding ? "Adding..." : `Add to cart · ${qty} pcs`}
          </Text>
        </Pressable>
      ) : (
        <View style={[styles.addButton, styles.addButtonDisabled]}>
          <Text style={styles.addButtonText}>Out of stock</Text>
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modal}><Text style={{ color: "#fff" }}>✓ Added to cart</Text></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", padding: 16, backgroundColor: "#fff" },
  image: { width: 240, height: 240, marginBottom: 14, borderRadius: 16, backgroundColor: "#f2f2f2" },
  title: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  price: { fontSize: 18, marginBottom: 8, color: "#111", fontWeight: "700" },

  stockRow: { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 8 },
  stockText: { fontSize: 13, color: "#4b5563" },
  lowStock: { fontSize: 12, color: "#b45309", backgroundColor: "#fef3c7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },

  oosChip: { backgroundColor: "#fee2e2", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginBottom: 8 },
  oosText: { color: "#b91c1c", fontWeight: "800" },

  qtyContainer: { flexDirection: "row", alignItems: "center", marginVertical: 12, gap: 14 },
  qtyBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#111827" },
  qtyBtnDisabled: { backgroundColor: "#9ca3af" },
  qtyBtnText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  qtyText: { fontSize: 18, fontWeight: "700", minWidth: 28, textAlign: "center" },

  addButton: { backgroundColor: "tomato", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, minWidth: 200, alignItems: "center" },
  addButtonDisabled: { backgroundColor: "#9ca3af" },
  addButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  modal: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#00000080" },
});
