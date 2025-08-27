// components/AdminComponents/ProductRow.tsx
import React, { useMemo } from "react";
import { View, Text, TextInput, Image, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import type { Draft, Product } from "../../types/types";

const PLACEHOLDER = "https://via.placeholder.com/64?text=%20";

type Props = {
  product: Product;
  draft?: Draft;                              // may be undefined on first render
  setDraft: (id: string, patch: Partial<Draft>) => void;
  onUpdate: (id: string) => void;
  onBump: (id: string, delta: number) => void;
  isSaving?: boolean;
  isBumping?: boolean;
};

export default function ProductRow({
  product,
  draft,
  setDraft,
  onUpdate,
  onBump,
  isSaving,
  isBumping,
}: Props) {
  const { colors, isDark } = useAppTheme();
  const s = useMemo(() => styles(colors, isDark), [colors, isDark]);

  // Safe fallback for the first render
  const d: Draft = useMemo(
    () => ({
      title: draft?.title ?? product.title ?? "",
      price: draft?.price ?? String(product.price ?? ""),
      inventory: draft?.inventory ?? String(product.inventory ?? ""),
      image: draft?.image ?? product.image ?? "",
    }),
    [draft, product]
  );

  return (
    <View style={s.card}>
      <View style={[s.row, { marginBottom: 10 }]}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{product.title}</Text>
          <Text style={s.subtle}>
            Current: ₪{(product.price ?? 0).toFixed(2)} • In stock: {product.inventory ?? 0}
          </Text>
        </View>

        {!!d.image ? (
          <Image source={{ uri: d.image }} style={s.previewSm} />
        ) : (
          <Image source={{ uri: PLACEHOLDER }} style={s.previewSm} />
        )}
      </View>

      <TextInput
        placeholder="Title"
        value={d.title}
        onChangeText={(v) => setDraft(product._id, { title: v })}
        style={s.input}
        placeholderTextColor={colors.muted}
      />
      <TextInput
        placeholder="Price"
        value={d.price}
        onChangeText={(v) => setDraft(product._id, { price: v })}
        keyboardType="numeric"
        style={s.input}
        placeholderTextColor={colors.muted}
      />
      <TextInput
        placeholder="Inventory"
        value={d.inventory}
        onChangeText={(v) => setDraft(product._id, { inventory: v })}
        keyboardType="numeric"
        style={s.input}
        placeholderTextColor={colors.muted}
      />
      <TextInput
        placeholder="Image URL (required)"
        value={d.image}
        onChangeText={(v) => setDraft(product._id, { image: v })}
        autoCapitalize="none"
        style={s.input}
        placeholderTextColor={colors.muted}
      />

      <View style={[s.row, { gap: 8, marginTop: 8 }]}>
        <Pressable
          onPress={() => onUpdate(product._id)}
          style={[s.primaryBtn, { flex: 1 }, isSaving && { opacity: 0.7 }]}
          disabled={isSaving}
        >
          {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryTxt}>Update</Text>}
        </Pressable>

        <Pressable
          onPress={() => onBump(product._id, +1)}
          style={[s.successBtn, isBumping && { opacity: 0.7 }]}
          disabled={isBumping}
        >
          {isBumping ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>+1</Text>}
        </Pressable>
        <Pressable
          onPress={() => onBump(product._id, -1)}
          style={[s.dangerBtn, isBumping && { opacity: 0.7 }]}
          disabled={isBumping}
        >
          {isBumping ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>-1</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = (c: any, isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 12,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
    row: { flexDirection: "row", alignItems: "center", gap: 10 },
    cardTitle: { fontSize: 16, fontWeight: "800", color: c.text },
    subtle: { color: c.muted, marginTop: 2 },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: isDark ? "#0f1113" : "#fff",
      color: c.text,
      padding: 10,
      borderRadius: 10,
      marginBottom: 8,
    },
    previewSm: { width: 56, height: 56, borderRadius: 10, borderWidth: 1, borderColor: c.border },
    primaryBtn: {
      backgroundColor: c.primary,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    successBtn: {
      backgroundColor: c.success || "#16a34a",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    dangerBtn: {
      backgroundColor: c.danger || "#ef4444",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryTxt: { color: "#fff", fontWeight: "800" },
    btnTxt: { color: "#fff", fontWeight: "800" },
  });
