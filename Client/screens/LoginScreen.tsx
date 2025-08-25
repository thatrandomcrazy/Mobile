// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config";

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  MainTabs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BIOMETRIC_TOKEN_KEY = "refreshToken";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const navigation = useNavigation<NavigationProp>();

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

  const onLoginSuccess = async (token: string) => {
    // שומר/ת את הטוקן לסשן הנוכחי
    await AsyncStorage.setItem("token", token);
    // שומר/ת עותק מאובטח להזדהות ביומטרית בהתחברויות הבאות
    await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token);
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setLoading(true);
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
      const token = data?.token;
      if (!token) {
        Alert.alert("Login Failed", "Missing token in response");
        return;
      }
      await onLoginSuccess(token);
    } catch {
      Alert.alert("Error", "Network error, check your server and IP");
    } finally {
      setLoading(false);
    }
  };

  const signInWithBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) {
        Alert.alert("Biometrics unavailable", "Enable Face/Touch ID in device settings.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Sign in",
        cancelLabel: "Cancel",
        disableDeviceFallback: false, // מאפשר קוד גישה כמנגנון גיבוי ב-iOS
        requireConfirmation: false,   // אנדרואיד
      });

      if (!result.success) return;

      const saved = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
      if (!saved) {
        Alert.alert("No saved session", "Log in once with password first.");
        return;
      }
      await AsyncStorage.setItem("token", saved);
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    } catch (e: any) {
      Alert.alert("Biometric error", e?.message || "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}

      {bioAvailable && (
        <Pressable style={styles.bioBtn} onPress={signInWithBiometrics}>
          <Text style={styles.bioTxt}>Sign in with Face ID / Touch ID</Text>
        </Pressable>
      )}

      <Pressable onPress={() => navigation.navigate("Register")} style={{ marginTop: 12 }}>
        <Text style={{ color: "#007aff", textAlign: "center", fontWeight: "700" }}>
          Create an account
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginBottom: 15,
  },
  bioBtn: {
    marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: "#111827", alignItems: "center",
  },
  bioTxt: { color: "#fff", fontWeight: "700" },
});
