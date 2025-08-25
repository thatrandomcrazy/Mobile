// src/screens/MenuScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View, TextInput, FlatList, StyleSheet, Pressable, Text,
  ActivityIndicator, SafeAreaView, StatusBar, Platform
} from "react-native";
import ProductCard from "../components/ProductCard";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config";
import { getCartCount } from "../utils/cartStorage";

type ProductFromApi = { _id?: string; id?: string; title?: string; price?: number; image?: string; inventory?: number; };
type ProductUI = { id: string; title: string; price: number; image: string; inventory: number };

const FETCH_TIMEOUT = 8000;
const SAFE_TOP = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

async function fetchWithTimeout(url: string, ms = FETCH_TIMEOUT) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(`${url}?t=${Date.now()}`, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    return res;
  } finally { clearTimeout(t); }
}

const toAbsImage = (src?: string, base = API_URL): string => {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/")) return `${base}${src}`;
  return `${base}/uploads/${src}`;
};

export default function MenuScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductUI[]>([]);
  const [filteredMenu, setFilteredMenu] = useState<ProductUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const loadProducts = useCallback(async () => {
    setLoading(true); setErr(null);
    const urls = [`${API_URL}/products`, `${API_URL}/api/products`];
    let lastErr: any = null;

    for (const url of urls) {
      try {
        const res = await fetchWithTimeout(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();
        const arr: ProductFromApi[] = Array.isArray(raw) ? raw : raw?.products || [];
        const normalized: ProductUI[] = arr.map((p) => ({
          id: String(p._id ?? p.id ?? ""),
          title: String(p.title ?? ""),
          price: Number(p.price ?? 0),
          image: toAbsImage(p.image),
          inventory: Number(p.inventory ?? 0),
        })).filter((p) => p.id);

        setProducts(normalized);
        setFilteredMenu(normalized);
        setLoading(false);
        return;
      } catch (e: any) { lastErr = e; }
    }
    setErr(lastErr?.name === "AbortError" ? "Timeout" : lastErr?.message || "Network error");
    setLoading(false);
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts, reloadTick]);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFilteredMenu(!q ? products : products.filter((i) => i.title.toLowerCase().includes(q)));
  }, [search, products]);

  // טען מונה עגלה בכל פוקוס למסך
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        const c = await getCartCount();
        if (mounted) setCartCount(c);
      })();
      return () => { mounted = false; };
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: SAFE_TOP }]}>
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>Loading menu…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (err) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: SAFE_TOP }]}>
        <View style={[styles.container, styles.center]}>
          <Text style={{ color: "crimson", fontWeight: "bold", marginBottom: 8 }}>
            Can't load products: {err}
          </Text>
          <Text style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Tried:</Text>
          <Text style={{ fontSize: 12, opacity: 0.7 }}>{`${API_URL}/products`}</Text>
          <Text style={{ fontSize: 12, opacity: 0.7 }}>{`${API_URL}/api/products`}</Text>
          <Pressable style={{ marginTop: 12 }} onPress={() => setReloadTick((x) => x + 1)}>
            <Text style={{ color: "#007aff" }}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: SAFE_TOP }]}>
      <View style={{ flex: 1, padding: 8 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Menu</Text>
          <Pressable onPress={() => navigation.navigate("Cart")} style={{ paddingHorizontal: 8 }}>
            <Ionicons name="cart" size={28} color="tomato" />
            {!!cartCount && (
              <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>
            )}
          </Pressable>
        </View>

        <TextInput placeholder="Search..." value={search} onChangeText={setSearch} style={styles.input} />

        <FlatList
          data={filteredMenu}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard item={item} onPress={() => navigation.navigate("ProductDetails", item)} />
          )}
          ListEmptyComponent={<View style={styles.center}><Text style={{ color: "#666" }}>No products found 😢</Text></View>}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 8 },
  container: { flex: 1, padding: 8 },
  center: { alignItems: "center", justifyContent: "center", padding: 20 },
  badge: {
    position: "absolute", right: 2, top: -4, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: "tomato", alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
});
