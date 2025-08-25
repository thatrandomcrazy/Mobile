import {
  NavigationProp,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View, Alert, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config";
import { CartItem, getCart, setCart, clearCart } from "../utils/cartStorage";
import { useAppTheme } from "../theme/ThemeProvider";

type RootStackParamList = {
  MainTabs: { screen: "Menu"; params?: any };
  Cart: undefined;
};

const PLACEHOLDER = "https://via.placeholder.com/48?text=%20";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { colors } = useAppTheme();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        const c = await getCart();
        if (mounted) setItems(c);
      })();
      return () => { mounted = false; };
    }, [])
  );

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  const updateItemQty = useCallback((id: string, delta: number) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx === -1) return prev;

      const item = prev[idx];
      const max = Number.isFinite(item.inventory) ? item.inventory : Number.MAX_SAFE_INTEGER;
      const target = Math.max(1, Math.min(max, item.qty + delta));

      if (target === item.qty && delta > 0 && Number.isFinite(max)) {
        Alert.alert("Stock limit", `Only ${max} in stock for "${item.title}".`);
        return prev;
      }

      const next = [...prev];
      next[idx] = { ...item, qty: target };
      setCart(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    Alert.alert("Remove item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setItems(prev => {
            const next = prev.filter(i => i.id !== id);
            setCart(next);
            return next;
          });
        },
      },
    ]);
  }, []);

  const submitOrder = useCallback(async () => {
    if (!items.length) return Alert.alert("Cart is empty");
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) { Alert.alert("You must log in first"); return; }

      const urls = [`${API_URL}/orders`, `${API_URL}/api/orders`];
      let lastErr: any = null;

      for (const url of urls) {
        try {
          const res = await fetch(url.replace(/\/+$/, ""), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            body: JSON.stringify({ items, total }),
          });

          const text = await res.text();
          let data: any = null;
          try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }

          if (res.ok) {
            Alert.alert("Order placed successfully!");
            await clearCart();
            setItems([]);
            navigation.navigate("MainTabs", { screen: "Menu" });
            setLoading(false);
            return;
          } else {
            lastErr = new Error(data?.message || `HTTP ${res.status}`);
          }
        } catch (e: any) {
          lastErr = e;
        }
      }
      throw lastErr || new Error("Network error");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [items, total, navigation]);

  const clearAll = useCallback(() => {
    Alert.alert("Clear cart", "Remove all items from cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearCart();
          setItems([]);
          navigation.navigate("MainTabs", { screen: "Menu" });
        },
      },
    ]);
  }, [navigation]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ color: colors.muted }}>Your cart is empty</Text>}
        renderItem={({ item }) => {
          const atMax = Number.isFinite(item.inventory) && item.qty >= item.inventory;
          return (
            <View style={[styles.row, { borderColor: colors.border }]}>
              <View style={styles.left}>
                <Image
                  source={{ uri: item.image || PLACEHOLDER }}
                  style={[styles.thumb, { backgroundColor: colors.card, borderColor: colors.border }]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <View style={styles.qtyBar}>
                    <Pressable
                      style={[
                        styles.qtyBtn,
                        { backgroundColor: colors.primary },
                        item.qty <= 1 && { backgroundColor: colors.muted },
                      ]}
                      onPress={() => updateItemQty(item.id, -1)}
                      disabled={item.qty <= 1}
                    >
                      <Ionicons name="remove" size={16} color="#fff" />
                    </Pressable>

                    <Text style={[styles.qtyText, { color: colors.text }]}>{item.qty}</Text>

                    <Pressable
                      style={[
                        styles.qtyBtn,
                        { backgroundColor: colors.primary },
                        atMax && { backgroundColor: colors.muted },
                      ]}
                      onPress={() => updateItemQty(item.id, +1)}
                      disabled={!!atMax}
                    >
                      <Ionicons name="add" size={16} color="#fff" />
                    </Pressable>

                    <Pressable
                      style={[
                        styles.trashBtn,
                        { borderColor: colors.danger, backgroundColor: colors.card },
                      ]}
                      onPress={() => removeItem(item.id)}
                    >
                      <Ionicons name="trash" size={16} color={colors.danger} />
                    </Pressable>
                  </View>

                  {Number.isFinite(item.inventory) && (
                    <Text style={[styles.stockNote, { color: colors.muted }]}>
                      In stock: {item.inventory}
                    </Text>
                  )}
                </View>
              </View>

              <Text style={[styles.price, { color: colors.text }]}>
                ₪{(item.price * item.qty).toFixed(2)}
              </Text>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 12 }}
        style={{ flex: 1 }}
      />

      <View
        style={[
          styles.footer,
          { borderTopColor: colors.border, backgroundColor: colors.card, paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <Text style={[styles.total, { color: colors.text }]}>Total: ₪{total.toFixed(2)}</Text>

        <Pressable
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={submitOrder}
          disabled={loading}
        >
          <Text style={{ color: "#fff" }}>{loading ? "Submitting..." : "Place Order"}</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, { backgroundColor: colors.muted, marginTop: 8 }]}
          onPress={clearAll}
          disabled={loading}
        >
          <Text style={{ color: "#fff" }}>Clear All</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },

  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
  },

  title: { fontSize: 14, marginBottom: 6 },

  qtyBar: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnDisabled: {},
  qtyText: { minWidth: 24, textAlign: "center", fontWeight: "700" },
  trashBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 8,
  },
  stockNote: { marginTop: 4, fontSize: 11 },

  price: { fontWeight: "700" },

  footer: { borderTopWidth: 1, paddingTop: 12 },
  total: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  btn: { padding: 12, borderRadius: 8, alignItems: "center" },
});
