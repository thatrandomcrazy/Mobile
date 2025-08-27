import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationProp, useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";
import { CartItem, clearCart } from "../utils/cartStorage";
import CartItemRow from "../components/Cart components/CartItemRow";
import EmptyCart from "../components/Cart components/EmptyCart";
import { useCartLoader } from "../hook/useCartLoader";
import { submitOrderApi } from "../utils/orderApi";

type RootStackParamList = { MainTabs: { screen: "Menu"; params?: any }; Cart: undefined };

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { colors } = useAppTheme();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCartLoader(setItems));

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  const onPlaceOrder = useCallback(async () => {
    if (!items.length) return alert("Cart is empty");
    try {
      setLoading(true);
      await submitOrderApi(items, total);
      alert("Order placed successfully!");
      await clearCart();
      setItems([]);
      navigation.navigate("MainTabs", { screen: "Menu" });
    } catch (e: any) {
      alert(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [items, total, navigation]);

  const onClearAll = useCallback(async () => {
    await clearCart();
    setItems([]);
    navigation.navigate("MainTabs", { screen: "Menu" });
  }, [navigation]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        ListEmptyComponent={<EmptyCart />}
        renderItem={({ item }) => (
          <CartItemRow item={item} onChange={setItems} />
        )}
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
          onPress={onPlaceOrder}
          disabled={loading}
        >
          <Text style={{ color: "#fff" }}>{loading ? "Submitting..." : "Place Order"}</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, { backgroundColor: colors.muted, marginTop: 8 }]}
          onPress={onClearAll}
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
  footer: { borderTopWidth: 1, paddingTop: 12 },
  total: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  btn: { padding: 12, borderRadius: 8, alignItems: "center" },
});
