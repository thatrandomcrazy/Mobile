// src/screens/RegisterScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { API_URL } from "../config";
import { useAppTheme } from "../theme/ThemeProvider";

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  MainTabs: undefined;
  OtpVerify: { mode: "register" | "login"; phone: string; username?: string; password?: string };
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

function normalizeILPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("972")) return `+${digits}`;
  if (digits.startsWith("0")) return `+972${digits.slice(1)}`;
  if (digits.startsWith("5")) return `+972${digits}`;
  return `+${digits}`;
}

function isValidILMobile(normalized: string) {
  // +9725XXXXXXXX (10 digits after country code, starts with 5)
  return /^\+9725\d{8}$/.test(normalized);
}

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useAppTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const [uErr, setUErr] = useState<string | null>(null);
  const [pErr, setPErr] = useState<string | null>(null);
  const [phErr, setPhErr] = useState<string | null>(null);

  const submit = async () => {
    setUErr(null);
    setPErr(null);
    setPhErr(null);

    const u = username.trim();
    const pass = password.trim();
    const phoneNorm = normalizeILPhone(phone.trim());

    let valid = true;

    if (u.length < 3 || u.length > 20) {
      setUErr("Username must be 3–20 characters");
      valid = false;
    }
    if (pass.length < 6) {
      setPErr("Password must be at least 6 characters");
      valid = false;
    }
    if (!isValidILMobile(phoneNorm)) {
      setPhErr("Phone must be an IL mobile (+9725XXXXXXXX)");
      valid = false;
    }

    if (!valid) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      const res = await fetch(`${API_URL}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNorm }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Alert.alert("Send Failed", data?.message || `HTTP ${res.status}`);
        return;
      }

      // keep normalized phone in UI
      setPhone(phoneNorm);

      navigation.navigate("OtpVerify", {
        mode: "register",
        phone: phoneNorm,
        username: u,
        password: pass,
      });
    } catch {
      Alert.alert("Error", "Network error while sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Create your account</Text>

      {/* Username (first) */}
      <TextInput
        style={[
          styles.input,
          { borderColor: uErr ? "#ff4d4f" : colors.border, color: colors.text, backgroundColor: isDark ? "#0f1113" : "#fff" },
        ]}
        placeholder="Username"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        value={username}
        onChangeText={(v) => {
          setUsername(v);
          if (uErr) setUErr(null);
        }}
        returnKeyType="next"
      />
      {uErr ? <Text style={styles.errTxt}>{uErr}</Text> : null}

      {/* Password (second) */}
      <TextInput
        style={[
          styles.input,
          { borderColor: pErr ? "#ff4d4f" : colors.border, color: colors.text, backgroundColor: isDark ? "#0f1113" : "#fff" },
        ]}
        placeholder="Password"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          if (pErr) setPErr(null);
        }}
        returnKeyType="next"
      />
      {pErr ? <Text style={styles.errTxt}>{pErr}</Text> : null}

      {/* Phone (third) */}
      <TextInput
        style={[
          styles.input,
          { borderColor: phErr ? "#ff4d4f" : colors.border, color: colors.text, backgroundColor: isDark ? "#0f1113" : "#fff" },
        ]}
        placeholder="Phone (+972...)"
        placeholderTextColor={colors.muted}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(v) => {
          setPhone(v);
          if (phErr) setPhErr(null);
        }}
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      {phErr ? <Text style={styles.errTxt}>{phErr}</Text> : null}

      <Pressable
        disabled={loading}
        style={[styles.primaryBtn, { backgroundColor: loading ? colors.border : colors.primary }]}
        onPress={submit}
      >
        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryTxt}>Sign Up</Text>}
      </Pressable>

      {/* Link to Login */}
      <View style={styles.row}>
        <Text style={{ color: colors.muted, marginRight: 6 }}>Already have an account?</Text>
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={{ color: colors.primary, fontWeight: "700" }}>Log in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 6 },
  primaryBtn: { paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 10 },
  primaryTxt: { color: "#fff", fontWeight: "700" },
  errTxt: { color: "#ff4d4f", marginBottom: 6, fontSize: 12 },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 14 },
});
