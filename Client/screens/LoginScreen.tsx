import React, { useState } from "react";
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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { API_URL } from "../config";

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  MainTabs: undefined;
  Cart: undefined;
  ProductDetails: { id: string } | undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

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

      await AsyncStorage.setItem("token", token);

      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    } catch {
      Alert.alert("Error", "Network error, check your server and IP");
    } finally {
      setLoading(false);
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

      {/* קישור להרשמה */}
      <View style={styles.registerRow}>
        <Text style={styles.registerText}>אין לך חשבון?</Text>
        <Pressable onPress={() => navigation.navigate("Register")} hitSlop={8}>
          <Text style={styles.registerLink}>הרשם/י</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
  },
  registerText: { color: "#555" },
  registerLink: { color: "#007aff", fontWeight: "700" },
});
