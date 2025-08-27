import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config";

const BIOMETRIC_TOKEN_KEY = "refreshToken";

export function useLogin(navigation: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(false);

  const onLoginSuccess = async (token: string, role?: string) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("role", role || "customer");
    await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token);
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  };

  const handlePwdLogin = async () => {
    if (!username || !password) { alert("Enter username and password"); return; }
    setLoadingPwd(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.token) throw new Error(data?.message || "Login failed");
      await onLoginSuccess(data.token, data?.data?.role);
    } catch (e: any) {
      alert(e.message || "Error");
    } finally {
      setLoadingPwd(false);
    }
  };

  const handlePhoneLogin = async () => {
    if (!phone) { alert("Enter phone number"); return; }
    setLoadingPhone(true);
    try {
      const res = await fetch(`${API_URL}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Send failed");
      navigation.navigate("OtpVerify", { mode: "login", phone });
    } catch (e: any) {
      alert(e.message || "Error");
    } finally {
      setLoadingPhone(false);
    }
  };

  return {
    username, setUsername,
    password, setPassword,
    phone, setPhone,
    loadingPwd, loadingPhone,
    handlePwdLogin, handlePhoneLogin,
  };
}
