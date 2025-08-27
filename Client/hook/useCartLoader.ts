import { useCallback } from "react";
import { getCart } from "../utils/cartStorage";
import type { CartItem } from "../utils/cartStorage";

export function useCartLoader(setItems: React.Dispatch<React.SetStateAction<CartItem[]>>) {
  return useCallback(() => {
    let mounted = true;
    (async () => {
      const c = await getCart();
      if (mounted) setItems(c);
    })();
    return () => { mounted = false; };
  }, [setItems]);
}
