// src/config.ts
import { Platform } from "react-native";
import Constants from "expo-constants";

function resolveDevBase(): string {
  // קדימות ל-ENV אם הגדרת (ngrok/דומיין/IPv4)
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env) return env.replace(/\/+$/, "");

  // זיהוי דרך Expo (SDK שונים)
  const hostUri =
    (Constants as any)?.expoConfig?.hostUri ||
    (Constants as any)?.manifest?.debuggerHost ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

  // אם זה אמולטור אנדרואיד – תמיד 10.0.2.2
  if (Platform.OS === "android") return "http://10.0.2.2:5000";

  // אם יש hostUri (למשל "172.16.0.9:8081") – קח רק את ה-IP
  if (hostUri) return `http://${hostUri.split(":")[0]}:5000`;

  // נפילה בטוחה
  return Platform.OS === "ios" ? "http://127.0.0.1:5000" : "http://10.0.2.2:5000";
}

export const API_URL = __DEV__ ? resolveDevBase() : "https://your-production-domain.com";
