// components/Login components/BioButton.tsx
import React, { useEffect, useState } from "react";
import { Pressable, Text, StyleSheet, Platform, Alert } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";

const BIOMETRIC_TOKEN_KEY = "refreshToken";

export default function BioButton() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<any>();
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

  const signInWithBiometrics = async () => {
    try {
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
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] }); // מעבר לעמוד בית
    } catch (e: any) {
      Alert.alert("Biometric error", e?.message || "Something went wrong");
    }
  };

  if (!bioAvailable) return null;

  return (
    <Pressable style={[s.bioBtn, { borderColor: colors.border }]} onPress={signInWithBiometrics}>
      <Text style={[s.bioTxt, { color: colors.text }]}>Use Face ID / Touch ID</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
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
