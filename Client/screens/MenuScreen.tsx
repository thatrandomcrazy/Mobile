// src/screens/MenuScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  Text,
  ActivityIndicator,
} from "react-native";
import ProductCard from "../components/ProductCard";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

type CartItem = { id: string; title: string; price: number; qty: number };

// מהשרת יכולים להגיע שדות חסרים/אופציונליים
type ProductFromApi = { _id?: string; id?: string; title?: string; price?: number; image?: string };

// טיפוס UI עם שדות *חובה* שתואם ל-ProductCard
type ProductUI = { id: string; title: string; price: number; image: string };

const FETCH_TIMEOUT = 8000;

/** מוסיף timeout, מחזיר שגיאה עם טקסט תגובה כדי להבין למה נפל */
async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = FETCH_TIMEOUT) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(`${url}?t=${Date.now()}`, {
      signal: ctrl.signal,
      credentials: "include", // אם עובדים עם session cookies
      headers: { Accept: "application/json", ...(init.headers || {}) },
      ...init,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}${text ? ` – ${text.slice(0, 300)}` : ""}`);
    }
    return res;
  } finally {
    clearTimeout(t);
  }
}

/** קורא טוקן (אם יש) ושם Authorization */
async function authHeaders(): Promise<Record<string, string>> {
  try {
    const token = await AsyncStorage.getItem("token"); // ← ודא שזה אותו key שבו אתה שומר
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

const cleanBase = (base: string) => base.replace(/\/+$/, "");
const toAbsImage = (src?: string, base = API_URL): string => {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  const b = cleanBase(base);
  if (src.startsWith("/")) return `${b}${src}`;
  return `${b}/uploads/${src}`;
};

export default function MenuScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductUI[]>([]);
  const [filteredMenu, setFilteredMenu] = useState<ProductUI[]>([]);
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0); // מאפשר ריענון ידני

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setErr(null);

    const headers = await authHeaders();
    const urls = [`${cleanBase(API_URL)}/products`, `${cleanBase(API_URL)}/api/products`];

    let lastErr: any = null;
    for (const url of urls) {
      try {
        const res = await fetchWithTimeout(url, { headers });
        const raw = await res.json();
        const arr: ProductFromApi[] = Array.isArray(raw) ? raw : raw?.products || [];

        // נרמול ל-ProductUI עם שדות חובה
        const normalized: ProductUI[] = arr
          .map((p) => ({
            id: String(p._id ?? p.id ?? ""),
            title: String(p.title ?? ""),
            price: Number(p.price ?? 0),
            image: toAbsImage(p.image),
          }))
          .filter((p) => p.id);

        setProducts(normalized);
        setFilteredMenu(normalized);
        setLoading(false);
        return; // הצליח – מפסיקים לנסות
      } catch (e: any) {
        lastErr = e;
      }
    }

    setErr(lastErr?.name === "AbortError" ? "Timeout" : lastErr?.message || "Network error");
    setLoading(false);
  }, []);

  // Fetch products (מנסה /products ואז /api/products)
  useEffect(() => {
    loadProducts();
  }, [loadProducts, reloadTick]);

  // Update selectedItems when returning from ProductDetails
  useEffect(() => {
    if ((route.params as any)?.add) {
      const add = (route.params as any).add as CartItem;
      setSelectedItems((prev) => {
        const exists = prev.find((i) => i.id === add.id);
        return exists
          ? prev.map((i) => (i.id === add.id ? { ...i, qty: i.qty + add.qty } : i))
          : [...prev, add];
      });
    }
  }, [route.params]);

  // Search filter
  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFilteredMenu(!q ? products : products.filter((i) => i.title.toLowerCase().includes(q)));
  }, [search, products]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading menu…</Text>
      </View>
    );
  }

  if (err) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: "crimson", fontWeight: "bold", marginBottom: 8 }}>
          Can't load products: {err}
        </Text>
        <Text style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Tried:</Text>
        <Text style={{ fontSize: 12, opacity: 0.7 }}>{`${cleanBase(API_URL)}/products`}</Text>
        <Text style={{ fontSize: 12, opacity: 0.7 }}>{`${cleanBase(API_URL)}/api/products`}</Text>
        <Pressable style={{ marginTop: 12 }} onPress={() => setReloadTick((x) => x + 1)}>
          <Text style={{ color: "#007aff" }}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 8 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        <Pressable onPress={() => navigation.navigate("Cart", { items: selectedItems })}>
          <Ionicons name="cart" size={28} color="tomato" />
        </Pressable>
      </View>

      <TextInput
        placeholder="Search..."
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      <FlatList
        data={filteredMenu}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            item={item} // תואם ל-ProductCardItem: id/title/price/image הם חובה
            onPress={() => navigation.navigate("ProductDetails", item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: "#666" }}>No products found 😢</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 8 },
  container: { flex: 1, padding: 8 },
  center: { alignItems: "center", justifyContent: "center", padding: 20 },
});
