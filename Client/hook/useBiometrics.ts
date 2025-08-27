import { useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform, Alert } from "react-native";
import { API_URL } from "../config";

const BIOMETRIC_TOKEN_KEY = "refreshToken";

export function useBiometrics(onSuccess?: () => void) {
  const [bioAvailable, setBioAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setBioAvailable(hasHardware && enrolled);
      } catch {
        setBioAvailable(false);
      }
    })();
  }, []);

  const signInWithBiometrics = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Sign in",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
        requireConfirmation: Platform.OS === "android" ? false : undefined,
      });
      if (!result.success) return;
      const saved = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
      if (!saved) { Alert.alert("No saved session", "Log in once with password first."); return; }
      await AsyncStorage.setItem("token", saved);
      try {
        const me = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${saved}` }});
        const data = await me.json();
        await AsyncStorage.setItem("role", data?.role === "admin" ? "admin" : "customer");
      } catch {
        await AsyncStorage.setItem("role", "customer");
      }
      onSuccess?.();
    } catch (e: any) {
      Alert.alert("Biometric error", e?.message || "Something went wrong");
    }
  };

  return { bioAvailable, signInWithBiometrics };
}
