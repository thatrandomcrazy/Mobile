import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl, StyleSheet, Image, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config";
import { useAppTheme } from "../theme/ThemeProvider";

type OrderItem = { productId: string; title: string; price: number; qty: number; image?: string };
type Order = { _id: string; total: number; createdAt: string; items: OrderItem[]; status: OrderStatus };
type OrderStatus = "pending" | "preparing" | "ready" | "on_the_way" | "picked_up";

const PLACEHOLDER = "https://via.placeholder.com/64?text=%20";
const STATUSES: OrderStatus[] = ["pending", "preparing", "ready", "on_the_way", "picked_up"];
const LABEL: Record<OrderStatus,string> = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  on_the_way: "On the way",
  picked_up: "Picked up",
};

export default function AdminOrdersScreen() {
  const { colors } = useAppTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/admin`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const setStatus = async (id: string, status: OrderStatus) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated: Order = await res.json();
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } catch (e: any) {
      alert(e?.message || "Failed to update status");
    }
  };

  const StatusPill = ({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.primary : colors.card,
        marginRight: 6,
      }}
    >
      <Text style={{ color: active ? "#fff" : colors.text, fontWeight: "700", fontSize: 12 }}>{label}</Text>
    </Pressable>
  );

  const Empty = useMemo(() => (
    <View style={{ alignItems: "center", paddingVertical: 48 }}>
      <Ionicons name="receipt-outline" size={28} color={colors.muted} />
      <Text style={{ color: colors.muted, marginTop: 6 }}>No orders</Text>
    </View>
  ), [colors.muted]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: colors.text }}>Loading…</Text>
      </View>
    );
  }

  if (err) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <Ionicons name="alert-circle" size={22} color={colors.danger} />
        <Text style={{ color: colors.danger, fontWeight: "bold", marginTop: 6 }}>{err}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} titleColor={colors.text} />}
      contentContainerStyle={{ padding: 14 }}
      ListEmptyComponent={Empty}
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="receipt-outline" size={18} color={colors.text} />
              <Text style={{ fontWeight: "800", color: colors.text }}>Order #{item._id.slice(-6)}</Text>
            </View>
            <Text style={{ color: colors.text, fontWeight: "800" }}>₪{item.total.toFixed(2)}</Text>
          </View>

          <Text style={{ color: colors.muted, marginTop: 6 }}>
            {new Date(item.createdAt).toLocaleString("en-GB", { hour12: false, year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </Text>

          <View style={{ marginTop: 10, gap: 8 }}>
            {item.items.slice(0, 4).map((it, idx) => (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image source={{ uri: it.image || PLACEHOLDER }} style={{ width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "600" }} numberOfLines={1}>{it.title}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>× {it.qty}</Text>
                </View>
                <Text style={{ color: colors.text, fontWeight: "700" }}>₪{(it.price * it.qty).toFixed(2)}</Text>
              </View>
            ))}
            {item.items.length > 4 && <Text style={{ color: colors.muted, fontStyle: "italic" }}>+{item.items.length - 4} more…</Text>}
          </View>

          <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap" }}>
            {STATUSES.map((st) => (
              <StatusPill
                key={st}
                active={item.status === st}
                label={LABEL[st]}
                onPress={() => setStatus(item._id, st)}
              />
            ))}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
});
