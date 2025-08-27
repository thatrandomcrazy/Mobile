// src/config.ts
import { Platform } from "react-native";
import Constants from "expo-constants";

function resolveDevBase(): string {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env) {
    const cleaned = env.replace(/\/+$/, "");
    console.debug("[config] API from ENV:", cleaned);
    return cleaned;
  }

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

  if (Platform.OS === "android") {
    const url = "http://10.0.2.2:5000";
    console.debug("[config] API fallback (Android emulator):", url);
    return url;
  }

  const fallback = "http://172.16.0.9:5000";
  console.debug("[config] API fallback (manual IP):", fallback);
  return fallback;
}

export const API_URL = __DEV__ ? resolveDevBase() : "https://your-production-domain.com";
