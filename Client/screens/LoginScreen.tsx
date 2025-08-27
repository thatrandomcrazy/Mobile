// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config";
import { useAppTheme } from "../theme/ThemeProvider";

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  MainTabs: undefined;
  OtpVerify: { mode: "login" | "register"; phone: string; username?: string; password?: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BIOMETRIC_TOKEN_KEY = "refreshToken";

export default function LoginScreen() {
  const { colors, isDark } = useAppTheme();
  const navigation = useNavigation<NavigationProp>();

  const [mode, setMode] = useState<"choice" | "password" | "phone">("choice");

  // username/password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loadingPwd, setLoadingPwd] = useState(false);

  // phone
  const [phone, setPhone] = useState("");
  const [loadingPhone, setLoadingPhone] = useState(false);

  const onLoginSuccess = async (token: string) => {
    await AsyncStorage.setItem("token", token);
    await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token);
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  };

  const handlePwdLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Enter username and password");
      return;
    }
    setLoadingPwd(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Login Failed", data?.message || `HTTP ${res.status}`);
        return;
      }
      if (!data?.token) {
        Alert.alert("Login Failed", "Missing token in response");
        return;
      }
      await onLoginSuccess(data.token);
    } catch {
      Alert.alert("Error", "Network error");
    } finally {
      setLoadingPwd(false);
    }
  };

  const handlePhoneLogin = async () => {
    if (!phone) {
      Alert.alert("Error", "Enter phone number");
      return;
    }
    setLoadingPhone(true);
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
      navigation.navigate("OtpVerify", { mode: "login", phone });
    } catch {
      Alert.alert("Error", "Network error");
    } finally {
      setLoadingPhone(false);
    }
  };

  // ---- UI ----
  const Button = ({ text, onPress }: { text: string; onPress: () => void }) => (
    <Pressable
      style={[styles.btn, { backgroundColor: colors.primary }]}
      onPress={onPress}
    >
      <Text style={styles.btnTxt}>{text}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {mode === "choice" && (
        <>
          <Text style={[styles.title, { color: colors.text }]}>Login</Text>
          <Button text="Login with Password" onPress={() => setMode("password")} />
          <Button text="Login with Phone" onPress={() => setMode("phone")} />
          <Pressable onPress={() => navigation.navigate("Register")} style={{ marginTop: 12 }}>
            <Text style={{ color: colors.primary, textAlign: "center", fontWeight: "700" }}>
              Create an account
            </Text>
          </Pressable>
        </>
      )}

      {mode === "password" && (
        <>
          <Text style={[styles.title, { color: colors.text }]}>Login with Password</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: isDark ? "#0f1113" : "#fff" }]}
            placeholder="Username"
            placeholderTextColor={colors.muted}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: isDark ? "#0f1113" : "#fff" }]}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {loadingPwd ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Button text="Login" onPress={handlePwdLogin} />
          )}
          <Pressable onPress={() => setMode("choice")} style={{ marginTop: 10 }}>
            <Text style={{ color: colors.muted, textAlign: "center" }}>⬅ Back</Text>
          </Pressable>
        </>
      )}

      {mode === "phone" && (
        <>
          <Text style={[styles.title, { color: colors.text }]}>Login with Phone</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: isDark ? "#0f1113" : "#fff" }]}
            placeholder="Phone (+972...)"
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          {loadingPhone ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Button text="Send Code & Continue" onPress={handlePhoneLogin} />
          )}
          <Pressable onPress={() => setMode("choice")} style={{ marginTop: 10 }}>
            <Text style={{ color: colors.muted, textAlign: "center" }}>⬅ Back</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 12 },
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 6,
    alignItems: "center",
  },
  btnTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
