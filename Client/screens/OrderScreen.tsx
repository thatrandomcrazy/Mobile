// src/screens/OrdersScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config";
import { useAppTheme } from "../theme/ThemeProvider";

type OrderItem = { productId: string; title: string; price: number; qty: number; image?: string };
type Order = { _id: string; total: number; createdAt: string; items: OrderItem[] };

const PLACEHOLDER = "https://via.placeholder.com/64?text=%20";
const SAFE_TOP = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

export default function OrdersScreen() {
  const { colors } = useAppTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
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

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const EmptyState = useMemo(() => (
    <View style={styles.emptyWrap}>
      <View style={[styles.emptyBadge, { backgroundColor: colors.primary }]}>
        <Ionicons name="receipt-outline" size={20} color="#fff" />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</Text>
      <Text style={[styles.emptySub, { color: colors.muted }]}>
        Your orders will appear here after checkout.
      </Text>
    </View>
  ), [colors.primary, colors.text, colors.muted]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: SAFE_TOP, backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8, color: colors.text }}>Loading orders…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (err) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: SAFE_TOP, backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={22} color={colors.danger} />
          <Text style={{ color: colors.danger, fontWeight: "bold", marginTop: 6 }}>
            Can't load orders: {err}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: SAFE_TOP, backgroundColor: colors.background }]}>
      <FlatList
        data={orders}
        extraData={tick}
        keyExtractor={(o) => o._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text}
            titleColor={colors.text}
          />
        }
        contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 14, paddingBottom: 28 }}
        ListEmptyComponent={EmptyState}
        renderItem={({ item }) => <OrderCard order={item} />}
      />
    </SafeAreaView>
  );
}

function minutesSince(dateStr: string) {
  const created = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - created) / 60000));
}

/**
 * ממפה סטטוס לזוג (תווית, צבע, אייקון) תוך שימוש רק בצבעים מה־theme:
 * - Ready -> success
 * - On the way -> primary
 * - Preparing -> danger  (כי אין warning ב־Colors)
 * - Pending -> muted
 */
function getStatus(createdAt: string, palette: {
  success: string; primary: string; danger: string; muted: string;
}): {
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
} {
  const mins = minutesSince(createdAt);

  if (mins >= 60) {
    return { label: "Ready", color: palette.success, icon: "checkmark-circle" };
  } else if (mins >= 30) {
    return { label: "On the way", color: palette.primary, icon: "bicycle" };
  } else if (mins >= 10) {
    return { label: "Preparing", color: palette.danger, icon: "construct" };
  } else {
    return { label: "Pending approval", color: palette.muted, icon: "time" };
  }
}

function OrderCard({ order }: { order: Order }) {
  const { colors } = useAppTheme();

  const prettyDate = useMemo(
    () =>
      new Date(order.createdAt).toLocaleString("en-GB", {
        hour12: false,
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [order.createdAt]
  );

  const status = getStatus(order.createdAt, {
    success: colors.success,
    primary: colors.primary,
    danger: colors.danger,
    muted: colors.muted,
  });

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: "#000",
      }
    ]}>
      <View style={[styles.cardAccent, { backgroundColor: status.color }]} />

      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Ionicons name="receipt-outline" size={18} color={colors.text} />
          <Text style={[styles.title, { color: colors.text }]}>
            Order #{order._id.slice(-6)}
          </Text>
        </View>

        <View style={[styles.statusPill, { backgroundColor: status.color }]}>
          <Ionicons name={status.icon} size={14} color="#fff" />
          <Text style={styles.statusText}>{status.label}</Text>
        </View>
      </View>

      <Text style={[styles.date, { color: colors.muted }]}>{prettyDate}</Text>

      <View style={styles.itemsWrap}>
        {order.items.slice(0, 4).map((it, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Image
              source={{ uri: it.image || PLACEHOLDER }}
              style={[
                styles.thumb,
                { backgroundColor: colors.card, borderColor: colors.border }
              ]}
              onError={() => {}}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                {it.title}
              </Text>
              <Text style={[styles.itemSub, { color: colors.muted }]}>× {it.qty}</Text>
            </View>
            <Text style={[styles.itemPrice, { color: colors.text }]}>
              ₪{(it.price * it.qty).toFixed(2)}
            </Text>
          </View>
        ))}
        {order.items.length > 4 && (
          <Text style={[styles.more, { color: colors.muted }]}>
            +{order.items.length - 4} more…
          </Text>
        )}
      </View>

      <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerLabel, { color: colors.muted }]}>Total</Text>
        <Text style={[styles.footerTotal, { color: colors.text }]}>
          ₪{order.total.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },

  card: {
    position: "relative",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: { fontSize: 16, fontWeight: "800" },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: { color: "#fff", fontWeight: "800", fontSize: 12, letterSpacing: 0.2 },

  date: { fontSize: 12, marginTop: 6 },

  itemsWrap: { marginTop: 10, gap: 8 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemTitle: { fontSize: 14, fontWeight: "600" },
  itemSub: { fontSize: 12, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: "700" },

  more: { marginTop: 4, fontStyle: "italic" },

  footerRow: {
    marginTop: 10,
    borderTopWidth: 1,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLabel: { fontSize: 13 },
  footerTotal: { fontSize: 15, fontWeight: "800" },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "800" },
  emptySub: { fontSize: 13 },
});
