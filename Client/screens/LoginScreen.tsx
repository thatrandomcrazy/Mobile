// screens/Login/LoginScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import Button from "../components/Login components/Button";
import BioButton from "../components/Login components/BioButton";
import { useLogin } from "../hook/useLogin";

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  MainTabs: undefined;
  OtpVerify: { mode: "login" | "register"; phone: string; username?: string; password?: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const { colors, isDark } = useAppTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    username, setUsername,
    password, setPassword,
    phone, setPhone,
    loadingPwd, loadingPhone,
    handlePwdLogin, handlePhoneLogin,
  } = useLogin(navigation);

  const [mode, setMode] = useState<"choice" | "password" | "phone">("choice");

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      {mode === "choice" && (
        <>
          <Text style={[s.title, { color: colors.text }]}>Login</Text>
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
          <Text style={[s.title, { color: colors.text }]}>Login with Password</Text>
          <TextInput
            style={[
              s.input,
              { borderColor: colors.border, color: colors.text, backgroundColor: isDark ? "#0f1113" : "#fff" },
            ]}
            placeholder="Username"
            placeholderTextColor={colors.muted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={[
              s.input,
              { borderColor: colors.border, color: colors.text, backgroundColor: isDark ? "#0f1113" : "#fff" },
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
          <Text style={[s.title, { color: colors.text }]}>Login with Phone</Text>
          <TextInput
            style={[
              s.input,
              { borderColor: colors.border, color: colors.text, backgroundColor: isDark ? "#0f1113" : "#fff" },
            ]}
            placeholder="Phone (+972...)"
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Button text="Send Code & Continue" onPress={handlePhoneLogin} busy={loadingPhone} />
          <Pressable onPress={() => setMode("choice")} style={{ marginTop: 10 }}>
            <Text style={{ color: colors.muted, textAlign: "center" }}>⬅ Back</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

/* inline styles */
const s = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 12 },
});
