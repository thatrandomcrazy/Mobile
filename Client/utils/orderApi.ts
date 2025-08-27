import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import type { CartItem } from "../utils/cartStorage";

export async function submitOrderApi(items: CartItem[], total: number) {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("You must log in first");

  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      items: items.map(({ id, title, price, qty, image }) => ({
        productId: id, title, price, qty, image,
      })),
      total,
    }),
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data;
}
