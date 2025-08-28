// src/screens/AdminMenuScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";
import { useAdminProducts } from "../hook/useAdminProducts";
import type { Draft } from "../types/types";
import ProductRow from "../components/AdminComponents/ProductRow";
import CreateProductModal from "../components/AdminComponents/CreateProductModal";
import FAB from "../components/AdminComponents/FAB";

export default function AdminMenuScreen() {
  const { colors } = useAppTheme();
  const s = useMemo(() => styles(colors), [colors]);

  const {
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
  } = useAdminProducts();

  const [showCreate, setShowCreate] = useState(false);

  // defensive: never spread undefined
  const setDraft = (id: string, patch: Partial<Draft>) => {
    setEdits((m) => ({
      ...m,
      [id]: { ...(m[id] ?? { title: "", price: "", inventory: "", image: "" }), ...patch },
    }));
  };

  if (loadingList) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator />
        <Text style={s.loadingText}>Loading…</Text>
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
          <View style={s.emptyWrap}>
            <Text style={s.emptyText}>No products yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          const fallback: Draft = {
            title: item.title ?? "",
            price: String(item.price ?? ""),
            inventory: String(item.inventory ?? ""),
            image: item.image ?? "",
          };
          return (
            <ProductRow
              product={item}
              draft={edits[item._id] ?? fallback}
              setDraft={setDraft}
              onUpdate={update}
              onBump={bumpInventory}
              isSaving={savingId === item._id}
              isBumping={bumpingId === item._id}
            />
          );
        }}
      />

      <FAB onPress={() => setShowCreate(true)} />

      <CreateProductModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={load}
        createProduct={createProduct}
      />
    </View>
  );
}

const styles = (c: any) =>
  StyleSheet.create({
    container: { flex: 1, padding: 14, backgroundColor: c.background },
    h1: { fontWeight: "900", fontSize: 18, color: c.text, marginBottom: 8 },
    center: { alignItems: "center", justifyContent: "center" },
    loadingText: { marginTop: 8, color: c.text },
    emptyWrap: { alignItems: "center", paddingVertical: 40 },
    emptyText: { color: c.muted },
  });
