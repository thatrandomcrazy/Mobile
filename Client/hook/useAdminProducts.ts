import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config"; 
import type { Product, Draft } from "../types/types";

export function useAdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [edits, setEdits] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [bumpingId, setBumpingId] = useState<string | null>(null);

  const authHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

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

  const validateUrl = (u: string) => /^https?:\/\/.+/i.test(u.trim());

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

  const createProduct = async (payload: { title: string; price: number; inventory: number; image: string }) => {
    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      Alert.alert("Created", "Product was created successfully.");
      await load();
      return true;
    } else {
      const err = await res.json().catch(() => ({}));
      Alert.alert("Create failed", err?.message || `HTTP ${res.status}`);
      return false;
    }
  };

  return {
    items,
    loadingList,
    refreshing,
    onRefresh,
    load,

    edits,
    setEdits,

    savingId,
    bumpingId,

    update,
    bumpInventory,

    createProduct,
  };
}
