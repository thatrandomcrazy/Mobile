// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
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

  // which UI to show
  const [mode, setMode] = useState<"choice" | "password" | "phone">("choice");

  // username/password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loadingPwd, setLoadingPwd] = useState(false);

  // phone
  const [phone, setPhone] = useState("");
  const [loadingPhone, setLoadingPhone] = useState(false);

  // biometrics
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

  const onLoginSuccess = async (token: string) => {
    await AsyncStorage.setItem("token", token);
    // נשמור גם בשביל כניסה ביומטרית בפעם הבאה
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

  const signInWithBiometrics = async () => {
    try {
      // ווידוא חומרה ורישום בפועל (Face/Touch)
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) {
        Alert.alert("Biometrics unavailable", "Enable Face/Touch ID in device settings.");
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Sign in",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
        requireConfirmation: Platform.OS === "android" ? false : undefined,
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

  // ---- UI ----
  const Button = ({
    text,
    onPress,
    variant = "primary",
    disabled,
    busy,
  }: {
    text: string;
    onPress: () => void;
    variant?: "primary" | "ghost";
    disabled?: boolean;
    busy?: boolean;
  }) => (
    <Pressable
      style={[
        styles.btn,
        {
          backgroundColor:
            variant === "primary" ? colors.primary : "transparent",
          borderWidth: variant === "ghost" ? 1 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {busy ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : colors.text} />
      ) : (
        <Text
          style={[
            styles.btnTxt,
            { color: variant === "primary" ? "#fff" : colors.text },
          ]}
        >
          {text}
        </Text>
      )}
    </Pressable>
  );

  const BioButton = () =>
    bioAvailable ? (
      <Pressable style={[styles.bioBtn, { borderColor: colors.border }]} onPress={signInWithBiometrics}>
        <Text style={[styles.bioTxt, { color: colors.text }]}>Use Face ID / Touch ID</Text>
      </Pressable>
    ) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {mode === "choice" && (
        <>
          <Text style={[styles.title, { color: colors.text }]}>Login</Text>
          <Button text="Login with Password" onPress={() => setMode("password")} />
          <Button text="Login with Phone" onPress={() => setMode("phone")} />
          <BioButton />
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
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: isDark ? "#0f1113" : "#fff",
              },
            ]}
            placeholder="Username"
            placeholderTextColor={colors.muted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: isDark ? "#0f1113" : "#fff",
              },
            ]}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button text="Login" onPress={handlePwdLogin} busy={loadingPwd} />
          <BioButton />
          <Pressable onPress={() => setMode("choice")} style={{ marginTop: 10 }}>
            <Text style={{ color: colors.muted, textAlign: "center" }}>⬅ Back</Text>
          </Pressable>
        </>
      )}

      {mode === "phone" && (
        <>
          <Text style={[styles.title, { color: colors.text }]}>Login with Phone</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: isDark ? "#0f1113" : "#fff",
              },
            ]}
            placeholder="Phone (+972...)"
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Button
            text="Send Code & Continue"
            onPress={handlePhoneLogin}
            busy={loadingPhone}
          />
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
  btnTxt: { fontWeight: "700", fontSize: 16 },
  bioBtn: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  bioTxt: { fontWeight: "700" },
});
