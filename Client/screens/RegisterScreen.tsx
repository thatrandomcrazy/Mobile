// src/screens/Register/RegisterScreen.tsx
import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import PrimaryButton from "../components/Register components/PrimaryButton";
import { useRegister } from "../hook/useRegister";

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  MainTabs: undefined;
  OtpVerify: { mode: "register" | "login"; phone: string; username?: string; password?: string };
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useAppTheme();

  const {
    username, setUsername,
    password, setPassword,
    phone, setPhone,
    uErr, pErr, phErr,
    loading,
    submit,
  } = useRegister(navigation);

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <Text style={[s.title, { color: colors.text }]}>Create your account</Text>

      <TextInput
        style={[
          s.input,
          { borderColor: uErr ? "#ff4d4f" : colors.border, color: colors.text, backgroundColor: isDark ? "#0f1113" : "#fff" },
        ]}
        placeholder="Username"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        value={username}
        onChangeText={(v) => setUsername(v)}
        returnKeyType="next"
      />
      {uErr ? <Text style={s.errTxt}>{uErr}</Text> : null}

      <TextInput
        style={[
          s.input,
          { borderColor: pErr ? "#ff4d4f" : colors.border, color: colors.text, backgroundColor: isDark ? "#0f1113" : "#fff" },
        ]}
        placeholder="Password"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={password}
        onChangeText={(v) => setPassword(v)}
        returnKeyType="next"
      />
      {pErr ? <Text style={s.errTxt}>{pErr}</Text> : null}

      <TextInput
        style={[
          s.input,
          { borderColor: phErr ? "#ff4d4f" : colors.border, color: colors.text, backgroundColor: isDark ? "#0f1113" : "#fff" },
        ]}
        placeholder="Phone (+972...)"
        placeholderTextColor={colors.muted}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(v) => setPhone(v)}
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      {phErr ? <Text style={s.errTxt}>{phErr}</Text> : null}

      <PrimaryButton text="Sign Up" loading={loading} onPress={submit} />

      <View style={s.row}>
        <Text style={{ color: colors.muted, marginRight: 6 }}>Already have an account?</Text>
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={{ color: colors.primary, fontWeight: "700" }}>Log in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 6 },
  errTxt: { color: "#ff4d4f", marginBottom: 6, fontSize: 12 },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 14 },
});
