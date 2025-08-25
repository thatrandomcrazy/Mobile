import React, { useState } from "react";
import { View, TextInput, StyleSheet, Alert, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { API_URL } from "../config";
import { useAppTheme } from "../theme/ThemeProvider";

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useAppTheme();

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Registration Failed", data?.message || "Please check your details");
        return;
      }
      Alert.alert("Success", "Registered successfully");
      navigation.navigate("Login");
    } catch {
      Alert.alert("Error", "Network or server issue");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {}
      <Text style={[styles.header, { color: colors.text }]}>Register</Text>

      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder="Username"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder="Password"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        onPress={handleRegister}
        style={[styles.btn, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.btnText}>Register</Text>
      </Pressable>

      <View style={styles.loginRow}>
        <Text style={[styles.loginText, { color: colors.muted }]}>
          Already have an account?
        </Text>
        <Pressable onPress={() => navigation.navigate("Login")} hitSlop={8}>
          <Text style={[styles.loginLink, { color: colors.primary }]}>Log in</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  header: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  btn: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
  },
  loginText: {},
  loginLink: { fontWeight: "700" },
});
