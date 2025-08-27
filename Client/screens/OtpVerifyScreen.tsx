// src/screens/OtpVerifyScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config";
import { useAppTheme } from "../theme/ThemeProvider";

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  MainTabs: undefined;
  OtpVerify: { mode: "register" | "login"; phone: string; username?: string; password?: string };
};

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "OtpVerify">;

const BIOMETRIC_TOKEN_KEY = "refreshToken";
const RESEND_SECONDS = 60;

export default function OtpVerifyScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { colors, isDark } = useAppTheme();

  const params = route?.params ?? {};
  const mode = (params as any).mode ?? "login";
  const phone = (params as any).phone ?? "";
  const username = (params as any).username;
  const password = (params as any).password;

  useEffect(() => {
    if (!phone) {
      Alert.alert("Missing data", "Phone number is required", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  }, [phone]);

  const [code, setCode] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1 && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [secondsLeft]);

  const onLoginSuccess = async (token: string) => {
    await AsyncStorage.setItem("token", token);
    await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token);
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  };

  const resend = async () => {
    if (!phone || secondsLeft > 0) return;
    setLoadingResend(true);
    try {
      const res = await fetch(`${API_URL}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Send Failed", data?.message || `HTTP ${res.status}`);
        return;
      }
      setSecondsLeft(RESEND_SECONDS);
      Alert.alert("OTP", "Code resent");
    } catch {
      Alert.alert("Error", "Network error");
    } finally {
      setLoadingResend(false);
    }
  };

  const verify = async () => {
    if (!phone) return;
    if (!/^\d{6}$/.test(code)) {
      Alert.alert("Error", "Enter a 6-digit code");
      return;
    }
    if (loadingVerify) return;
    setLoadingVerify(true);
    Keyboard.dismiss();

    try {
      if (mode === "register") {
        const res = await fetch(`${API_URL}/auth/otp/verify-register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, code, username, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          Alert.alert("Verify Failed", data?.message || `HTTP ${res.status}`);
          return;
        }
        if (data?.token) {
          await onLoginSuccess(data.token);
        } else {
          Alert.alert("Success", "Account created. Please log in.");
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }
      } else {
        const res = await fetch(`${API_URL}/auth/otp/verify-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, code }),
        });
        const data = await res.json();
        if (!res.ok) {
          Alert.alert("Verify Failed", data?.message || `HTTP ${res.status}`);
          return;
        }
        if (!data?.token) {
          Alert.alert("Login Failed", "Missing token");
          return;
        }
        await onLoginSuccess(data.token);
      }
    } catch {
      Alert.alert("Error", "Network error");
    } finally {
      setLoadingVerify(false);
    }
  };

  if (!phone) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: isDark ? "#0f1113" : "#fff", borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {mode === "register" ? "Verify phone to finish sign up" : "Verify phone to sign in"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{phone}</Text>

        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: isDark ? "#1c1c1c" : "#f9f9f9",
            },
          ]}
          placeholder="Enter 6-digit code"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
        />

        <Pressable
          disabled={loadingVerify}
          style={[styles.primaryBtn, { backgroundColor: loadingVerify ? colors.border : colors.primary }]}
          onPress={verify}
        >
          {loadingVerify ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryTxt}>Verify</Text>}
        </Pressable>

        <Pressable
          disabled={loadingResend || secondsLeft > 0}
          style={[styles.secondaryBtn, { backgroundColor: (loadingResend || secondsLeft > 0) ? colors.border : colors.primary  }]}
          onPress={resend}
        >
          {loadingResend ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.secondaryTxt}>
              {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  card: { width: "100%", maxWidth: 400, borderWidth: 1, borderRadius: 16, padding: 24, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 14, borderRadius: 10, marginBottom: 16, fontSize: 18, textAlign: "center", letterSpacing: 4 },
  primaryBtn: { paddingVertical: 14, borderRadius: 10, alignItems: "center", marginBottom: 12 },
  primaryTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtn: { paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  secondaryTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
