import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAuthRole() {
  const [role, setRole] = useState<"customer" | "admin" | null>(null);
  useEffect(() => { (async () => {
    const r = await AsyncStorage.getItem("role");
    setRole(r === "admin" ? "admin" : "customer");
  })(); }, []);
  return role;
}
