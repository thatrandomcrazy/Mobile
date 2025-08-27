// src/screens/AdminMenuScreen.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config";
import { useAppTheme } from "../theme/ThemeProvider";

type Product = { _id: string; title: string; price: number; image?: string; inventory: number };
type Draft = { title: string; price: string; inventory: string; image: string };

export default function AdminMenuScreen() {
  const { colors, isDark } = useAppTheme();
  const s = useMemo(() => styles(colors, isDark), [colors, isDark]);

  const [items, setItems] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // create product (in modal)
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [inventory, setInventory] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [creating, setCreating] = useState(false);

  // edit & inventory
  const [edits, setEdits] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [bumpingId, setBumpingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
      }
      const data: Product[] = await res.json();
      setItems(data);
    } catch (e: any) {
      Alert.alert("Load failed", e?.message || "Network error");
    } finally {
      setLoadingList(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const map: Record<string, Draft> = {};
    for (const p of items) {
      map[p._id] = {
        title: p.title,
        price: String(p.price ?? ""),
        inventory: String(p.inventory ?? ""),
        image: p.image ?? "",
      };
    }
    setEdits(map);
  }, [items]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  const authHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const validateUrl = (u: string) => /^https?:\/\/.+/i.test(u.trim());

  const resetCreateForm = () => {
    setTitle("");
    setPrice("");
    setInventory("");
    setImage("");
  };

  const create = async () => {
    if (!title.trim() || !price.trim() || !image.trim()) {
      Alert.alert("Missing fields", "Title, Price, and Image URL are required.");
      return;
    }
    if (!validateUrl(image)) {
      Alert.alert("Invalid Image URL", "Provide a valid http(s) image URL.");
      return;
    }
    const priceNum = Number(price);
    const invNum = Number.isFinite(Number(inventory)) ? Number(inventory) : 0;
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      Alert.alert("Invalid Price", "Price must be a non-negative number.");
      return;
    }

    setCreating(true);
    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({
        title: title.trim(),
        price: priceNum,
        inventory: invNum,
        image: image.trim(),
      }),
    });
    setCreating(false);

    if (res.ok) {
      Alert.alert("Created", "Product was created successfully.");
      resetCreateForm();
      setShowCreate(false);
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      Alert.alert("Create failed", err?.message || `HTTP ${res.status}`);
    }
  };

  const update = async (id: string) => {
    const d = edits[id];
    if (!d) return;

    if (!d.title.trim() || !d.price.trim() || !d.image.trim()) {
      Alert.alert("Missing fields", "Title, Price, and Image URL are required.");
      return;
    }
    if (!validateUrl(d.image)) {
      Alert.alert("Invalid Image URL", "Provide a valid http(s) image URL.");
      return;
    }

    const priceNum = Number(d.price);
    const invNum = Number.isFinite(Number(d.inventory)) ? Number(d.inventory) : 0;
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      Alert.alert("Invalid Price", "Price must be a non-negative number.");
      return;
    }

    setSavingId(id);
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify({
        title: d.title.trim(),
        price: priceNum,
        inventory: invNum,
        image: d.image.trim(),
      }),
    });
    setSavingId(null);

    if (res.ok) {
      Alert.alert("Updated", "Product was updated successfully.");
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      Alert.alert("Update failed", err?.message || `HTTP ${res.status}`);
    }
  };

  const bumpInventory = async (id: string, delta: number) => {
    setBumpingId(id);
    const res = await fetch(`${API_URL}/products/${id}/inventory`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify({ delta }),
    });
    setBumpingId(null);

    if (res.ok) {
      Alert.alert("Updated", "Inventory was adjusted.");
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      Alert.alert("Change inventory failed", err?.message || `HTTP ${res.status}`);
    }
  };

  if (loadingList) {
    return (
      <View style={[s.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: colors.text }}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.h1}>Products</Text>

      <FlatList
        data={items}
        keyExtractor={(p) => p._id}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text}
            titleColor={colors.text}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Text style={{ color: colors.muted }}>No products yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          const d = edits[item._id] || { title: "", price: "", inventory: "", image: "" };
          const isSaving = savingId === item._id;
          const isBumping = bumpingId === item._id;
          return (
            <View style={s.card}>
              <View style={[s.row, { marginBottom: 10 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{item.title}</Text>
                  <Text style={s.subtle}>Current: ₪{item.price.toFixed(2)} • In stock: {item.inventory}</Text>
                </View>
                {!!d.image ? (
                  <Image source={{ uri: d.image }} style={s.previewSm} />
                ) : (
                  <View style={[s.previewSm, s.previewPlaceholder]} />
                )}
              </View>

              <TextInput
                placeholder="Title"
                value={d.title}
                onChangeText={(v) => setEdits((m) => ({ ...m, [item._id]: { ...m[item._id], title: v } }))}
                style={s.input}
                placeholderTextColor={colors.muted}
              />
              <TextInput
                placeholder="Price"
                value={d.price}
                onChangeText={(v) => setEdits((m) => ({ ...m, [item._id]: { ...m[item._id], price: v } }))}
                keyboardType="numeric"
                style={s.input}
                placeholderTextColor={colors.muted}
              />
              <TextInput
                placeholder="Inventory"
                value={d.inventory}
                onChangeText={(v) => setEdits((m) => ({ ...m, [item._id]: { ...m[item._id], inventory: v } }))}
                keyboardType="numeric"
                style={s.input}
                placeholderTextColor={colors.muted}
              />
              <TextInput
                placeholder="Image URL (required)"
                value={d.image}
                onChangeText={(v) => setEdits((m) => ({ ...m, [item._id]: { ...m[item._id], image: v } }))}
                autoCapitalize="none"
                style={s.input}
                placeholderTextColor={colors.muted}
              />

              <View style={[s.row, { gap: 8, marginTop: 8 }]}>
                <Pressable
                  onPress={() => update(item._id)}
                  style={[s.primaryBtn, { flex: 1 }, isSaving && { opacity: 0.7 }]}
                  disabled={isSaving}
                >
                  {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryTxt}>Update</Text>}
                </Pressable>

                <Pressable
                  onPress={() => bumpInventory(item._id, +1)}
                  style={[s.successBtn, isBumping && { opacity: 0.7 }]}
                  disabled={isBumping}
                >
                  {isBumping ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>+1</Text>}
                </Pressable>
                <Pressable
                  onPress={() => bumpInventory(item._id, -1)}
                  style={[s.dangerBtn, isBumping && { opacity: 0.7 }]}
                  disabled={isBumping}
                >
                  {isBumping ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>-1</Text>}
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      {/* FAB - Add Product */}
      <Pressable style={s.fab} onPress={() => setShowCreate(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Create Product Modal */}
      <Modal
        visible={showCreate}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreate(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={s.modalBackdrop}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>Add Product</Text>

              <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                style={s.input}
                placeholderTextColor={colors.muted}
              />
              <TextInput
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={s.input}
                placeholderTextColor={colors.muted}
              />
              <TextInput
                placeholder="Inventory"
                value={inventory}
                onChangeText={setInventory}
                keyboardType="numeric"
                style={s.input}
                placeholderTextColor={colors.muted}
              />
              <TextInput
                placeholder="Image URL (required)"
                value={image}
                onChangeText={setImage}
                autoCapitalize="none"
                style={s.input}
                placeholderTextColor={colors.muted}
              />

              {!!image ? (
                <Image source={{ uri: image }} style={s.preview} />
              ) : (
                <View style={[s.preview, s.previewPlaceholder]}>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Preview</Text>
                </View>
              )}

              <View style={[s.row, { gap: 10, marginTop: 10 }]}>
                <Pressable
                  onPress={() => { resetCreateForm(); setShowCreate(false); }}
                  style={[s.secondaryBtn]}
                >
                  <Text style={s.secondaryTxt}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={create}
                  style={[s.primaryBtn, { flex: 1 }, creating && { opacity: 0.7 }]}
                  disabled={creating}
                >
                  {creating ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryTxt}>Create</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = (c: any, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, padding: 14, backgroundColor: c.background },
    h1: { fontWeight: "900", fontSize: 18, color: c.text, marginBottom: 8 },

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

    preview: { width: 84, height: 84, borderRadius: 10, borderWidth: 1, borderColor: c.border, alignSelf: "flex-start" },
    previewSm: { width: 56, height: 56, borderRadius: 10, borderWidth: 1, borderColor: c.border },
    previewPlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: c.background },

    primaryBtn: {
      backgroundColor: c.primary,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryTxt: { color: "#fff", fontWeight: "800" },

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
    btnTxt: { color: "#fff", fontWeight: "800" },

    secondaryBtn: {
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryTxt: { color: c.text, fontWeight: "800" },

    // FAB
    fab: {
      position: "absolute",
      right: 16,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },

    // Modal
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      padding: 16,
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: c.card,
      borderColor: c.border,
      borderWidth: 1,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 16,
      paddingBottom: 20,
    },
    modalTitle: { color: c.text, fontWeight: "900", fontSize: 18, marginBottom: 10 },
  });
