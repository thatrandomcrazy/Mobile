import { useState } from "react";
import { Keyboard, Alert } from "react-native";
import { API_URL } from "../config";
import { normalizeILPhone, isValidILMobile } from "../utils/phone";

export function useRegister(navigation: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const [uErr, setUErr] = useState<string | null>(null);
  const [pErr, setPErr] = useState<string | null>(null);
  const [phErr, setPhErr] = useState<string | null>(null);

  const submit = async () => {
    setUErr(null); setPErr(null); setPhErr(null);

    const u = username.trim();
    const pass = password.trim();
    const phoneNorm = normalizeILPhone(phone.trim());

    let valid = true;
    if (u.length < 3 || u.length > 20) { setUErr("Username must be 3–20 characters"); valid = false; }
    if (pass.length < 6) { setPErr("Password must be at least 6 characters"); valid = false; }
    if (!isValidILMobile(phoneNorm)) { setPhErr("Phone must be an IL mobile (+9725XXXXXXXX)"); valid = false; }
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

      setPhone(phoneNorm);
      navigation.navigate("OtpVerify", { mode: "register", phone: phoneNorm, username: u, password: pass });
    } catch {
      Alert.alert("Error", "Network error while sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return {
    username, setUsername,
    password, setPassword,
    phone, setPhone,
    uErr, pErr, phErr,
    loading,
    submit,
  };
}
