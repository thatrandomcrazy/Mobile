import React, { useCallback } from "react";
import { View, Text, Image, Pressable, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../theme/ThemeProvider";
import { CartItem, setCart } from "../../utils/cartStorage";
import QuantityControl from "./QuantityControl";

const PLACEHOLDER = "https://via.placeholder.com/48?text=%20";

export default function CartItemRow({
  item,
  onChange,
}: {
  item: CartItem;
  onChange: React.Dispatch<React.SetStateAction<CartItem[]>>;
}) {
  const { colors } = useAppTheme();

  const updateQty = useCallback((delta: number) => {
    onChange((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx === -1) return prev;
      const max = Number.isFinite(item.inventory) ? item.inventory : Number.MAX_SAFE_INTEGER;
      const nextQty = Math.max(1, Math.min(max, prev[idx].qty + delta));
      if (nextQty === prev[idx].qty && delta > 0 && Number.isFinite(max)) {
        Alert.alert("Stock limit", `Only ${max} in stock for "${item.title}".`);
        return prev;
      }
      const next = [...prev];
      next[idx] = { ...prev[idx], qty: nextQty };
      setCart(next);
      return next;
    });
  }, [item, onChange]);

  const remove = useCallback(() => {
    Alert.alert("Remove item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () =>
          onChange((prev) => {
            const next = prev.filter((i) => i.id !== item.id);
            setCart(next);
            return next;
          }),
      },
    ]);
  }, [item.id, onChange]);

  const atMax = Number.isFinite(item.inventory) && item.qty >= item.inventory;

  return (
    <View style={[s.row, { borderColor: colors.border }]}>
      <View style={s.left}>
        <Image
          source={{ uri: item.image || PLACEHOLDER }}
          style={[s.thumb, { backgroundColor: colors.card, borderColor: colors.border }]}
        />
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={s.qtyBar}>
            <QuantityControl
              onDec={() => updateQty(-1)}
              onInc={() => updateQty(+1)}
              canDec={item.qty > 1}
              canInc={!atMax}
            />
            <Pressable
              style={[s.trashBtn, { borderColor: colors.danger, backgroundColor: colors.card }]}
              onPress={remove}
            >
              <Ionicons name="trash" size={16} color={colors.danger} />
            </Pressable>
          </View>

          {Number.isFinite(item.inventory) && (
            <Text style={[s.stockNote, { color: colors.muted }]}>In stock: {item.inventory}</Text>
          )}
        </View>
      </View>

      <Text style={[s.price, { color: colors.text }]}>₪{(item.price * item.qty).toFixed(2)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 10, borderBottomWidth: 1, gap: 8,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  thumb: { width: 44, height: 44, borderRadius: 8, borderWidth: 1 },
  title: { fontSize: 14, marginBottom: 6 },
  qtyBar: { flexDirection: "row", alignItems: "center", gap: 8 },
  trashBtn: { paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderRadius: 8 },
  stockNote: { marginTop: 4, fontSize: 11 },
  price: { fontWeight: "700" },
});
