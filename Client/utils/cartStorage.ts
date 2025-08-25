// src/utils/cartStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type CartItem = { id: string; title: string; price: number; qty: number; image: string; inventory: number; };
const KEY = "cart";

export async function getCart(): Promise<CartItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function setCart(items: CartItem[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export async function clearCart() {
  await AsyncStorage.removeItem(KEY);
}

export async function addToCart(newItem: CartItem) {
  const items = await getCart();
  const idx = items.findIndex((i) => i.id === newItem.id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], qty: items[idx].qty + newItem.qty };
  } else {
    items.push(newItem);
  }
  await setCart(items);
}

export async function getCartCount(): Promise<number> {
  const items = await getCart();
  return items.reduce((s, i) => s + i.qty, 0);
}
