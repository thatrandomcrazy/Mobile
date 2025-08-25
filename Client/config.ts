// src/config.ts
import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * קובע כתובת בסיס ל־API בזמן פיתוח.
 * סדר עדיפויות:
 * 1) משתנה סביבה (אם תוסיף בעתיד .env)
 * 2) זיהוי אוטומטי מ־Expo hostUri (כשמריצים ב־LAN)
 * 3) אמולטור אנדרואיד → 10.0.2.2
 * 4) נפילה בטוחה: ה־IP של המחשב שלך ברשת (172.16.0.9)
 */
function resolveDevBase(): string {
  // 1) ENV (אם תוסיף EXPO_PUBLIC_API_BASE_URL)
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env) {
    const cleaned = env.replace(/\/+$/, "");
    console.debug("[config] API from ENV:", cleaned);
    return cleaned;
  }

  // 2) זיהוי דרך Expo (SDK שונים)
  const hostUri =
    (Constants as any)?.expoConfig?.hostUri ||
    (Constants as any)?.manifest?.debuggerHost ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    const url = `http://${host}:5000`;
    console.debug("[config] API from Expo hostUri:", url);
    return url;
  }

  // 3) אמולטור אנדרואיד
  if (Platform.OS === "android") {
    const url = "http://10.0.2.2:5000";
    console.debug("[config] API fallback (Android emulator):", url);
    return url;
  }

  // 4) נפילה בטוחה: כתובת המחשב שלך ברשת (טלפון אמיתי צריך IP אמיתי, לא localhost)
  const fallback = "http://192.168.56.1:5000";
  console.debug("[config] API fallback (manual IP):", fallback);
  return fallback;
}

// בזמן פרודקשן שים דומיין Production אמיתי במקום placeholder
export const API_URL = __DEV__ ? resolveDevBase() : "https://your-production-domain.com";
