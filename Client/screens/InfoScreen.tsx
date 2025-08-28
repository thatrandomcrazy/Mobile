// src/screens/InfoScreen/InfoScreen.tsx
import React, { useMemo, useRef } from "react";
import { View, Text, Image, ScrollView, StyleSheet, Platform, Share, Linking } from "react-native";
import MapView from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../theme/ThemeProvider";
import Card from "../components/Info components/Card";
import SectionHeader from "../components/Info components/SectionHeader";
import ActionBtn from "../components/Info components/ActionBtn";
import PrimaryBtn from "../components/Info components/PrimaryBtn";
import Pill from "../components/Info components/Pill";
import MapCard from "../components/Info components/MapCard";
import { HERO, ADDRESS, LAT, LNG } from "../constants/demo";
import * as Clipboard from "expo-clipboard";
import { useLocationTracking } from "../hook/useLocationTracking";

export default function InfoScreen() {
  const { colors, isDark } = useAppTheme();
  const s = useMemo(() => styles(colors), [colors]);
 const mapRef = useRef<MapView>(null!);
  const { myPos, tracking, toggleTracking } = useLocationTracking(mapRef);

  const centerOnMe = () => {
    if (!myPos) return;
    mapRef.current?.animateToRegion({ ...myPos, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
  };
  const centerOnPOI = () =>
    mapRef.current?.fitToCoordinates([{ latitude: LAT, longitude: LNG }], {
      edgePadding: { top: 40, bottom: 40, left: 40, right: 40 },
      animated: true,
    });

  return (
  <ScrollView contentContainerStyle={[s.scroll, { paddingTop: 30 }]}>
      <View style={s.heroWrap}>
        <Image source={{ uri: HERO }} style={s.hero} />
        <View style={[s.heroOverlay, { backgroundColor: "rgba(0,0,0,0.25)" }]} />
        <View style={s.heroContent}>
          <View style={s.logoWrap}><Text style={s.logoText}>BH</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Burger House</Text>
            <View style={s.row}>
              <Ionicons name="star" size={14} color="#ffd166" />
              <Text style={[s.subtle, { marginLeft: 4, color: "#61D67C" }]}>4.7 • 1.2k ratings</Text>
            </View>
          </View>
        </View>
      </View>

      <Card colors={colors}>
        <View style={[s.row, { flexWrap: "wrap", gap: 8 }]}>
          {["Burgers", "Fries", "Vegan", "Gluten-Free", "Kosher"].map((t) => (
            <View key={t} style={[s.chip, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[s.chipText, { color: colors.text }]}>{t}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card colors={colors}>
        <SectionHeader icon="location" title="Location" />
        <Text style={s.text}>{ADDRESS}</Text>
        <Text style={[s.subtle, { marginTop: 2 }]}>Near Habima • Parking on site</Text>

        <MapCard
          mapRef={mapRef}
          isDark={isDark}
          lat={LAT}
          lng={LNG}
          onMapPress={onMapPress}
          centerOnMe={centerOnMe}
          centerOnPOI={centerOnPOI}
          tracking={tracking}
          toggleTracking={toggleTracking}
        />

        <View style={[s.row, { gap: 10, marginTop: 10 }]}>
          <ActionBtn icon="navigate" label="Directions" onPress={openDirections} />
          <ActionBtn icon="copy" label="Copy address" onPress={copyAddress} />
          <ActionBtn icon="share-social" label="Share" onPress={shareAddress} />
        </View>
      </Card>

      <Card colors={colors}>
        <SectionHeader icon="time" title="Opening Hours" />
        {[
          ["Sun–Thu", "10:00 – 22:00"],
          ["Fri", "10:00 – 15:00"],
          ["Sat", "Closed"],
        ].map(([d, h], i) => (
          <View key={i} style={[s.rowBetween, s.rowPad, i > 0 && s.sep]}>
            <Text style={s.text}>{d}</Text>
            <Text style={[s.text, h === "Closed" ? { color: "#e11d48", fontWeight: "700" } : null]}>{h}</Text>
          </View>
        ))}
        <View style={[s.notice, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
          <Text style={[s.noticeText, { color: colors.text }]}>Open now • Kitchen closes 21:30</Text>
        </View>
      </Card>

      <Card colors={colors}>
        <SectionHeader icon="call" title="Contact" />
        <View style={[s.rowBetween, s.rowPad]}>
          <Text style={s.text}>Phone</Text>
          <Text style={s.text}>+972-52-2226889</Text>
        </View>
        <View style={[s.rowBetween, s.rowPad, s.sep]}>
          <Text style={s.text}>Email</Text>
          <Text style={s.text}>ofir071002@gmail.com</Text>
        </View>
        <View style={[s.row, { gap: 10, marginTop: 10 }]}>
          <PrimaryBtn icon="call" label="Call" onPress={callPhone} />
          <PrimaryBtn icon="chatbubbles" label="WhatsApp" onPress={openWhatsapp} />
          <PrimaryBtn icon="mail" label="Email" onPress={sendEmail} />
        </View>
      </Card>

      <Card colors={colors}>
        <SectionHeader icon="bicycle" title="Services" />
        <View style={[s.row, { gap: 10, flexWrap: "wrap" }]}>
          <Pill icon="bicycle" label="Delivery" color={colors.primary} />
          <Pill icon="bag-handle" label="Take-Away" color="#16a34a" />
          <Pill icon="restaurant" label="Dine-In" color={colors.primary} />
          <Pill icon="leaf" label="Vegan options" color="#16a34a" />
        </View>
      </Card>

      <View style={{ height: 16 }} />
    </ScrollView>
  );
}

function onMapPress() {
  openDirections();
}
function openDirections() {
  const query = `${LAT},${LNG}`;
  const url = Platform.select({
    ios: `http://maps.apple.com/?daddr=${query}`,
    android: `https://www.google.com/maps/dir/?api=1&destination=${query}`,
  });
  if (url) Linking.openURL(url);
}
async function copyAddress() { await Clipboard.setStringAsync(ADDRESS); }
function shareAddress() {
  Share.share({ message: `${ADDRESS}\nhttps://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}` });
}
function callPhone() { Linking.openURL(`tel:+972522226889`); }
function openWhatsapp() {
  const text = "Hi Burger House!";
  const url = `whatsapp://send?phone=+972522226889&text=${encodeURIComponent(text)}`;
  Linking.openURL(url);
}
function sendEmail() {
  const url = `mailto:ofir071002@gmail.com?subject=${encodeURIComponent("Table reservation")}&body=${encodeURIComponent("Hi, I'd like to reserve a table.")}`;
  Linking.openURL(url);
}

/* ---------- Inline styles ---------- */
const styles = (c: any) =>
  StyleSheet.create({
    scroll: { padding: 14 },
    heroWrap: { borderRadius: 16, overflow: "hidden", marginBottom: 12, position: "relative" },
    hero: { width: "100%", height: 160 },
    heroOverlay: { ...StyleSheet.absoluteFillObject },
    heroContent: { position: "absolute", left: 12, right: 12, bottom: 12, flexDirection: "row", alignItems: "center", gap: 12 },
    logoWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: c.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.border },
    logoText: { fontSize: 18, fontWeight: "900", color: c.text, letterSpacing: 1 },
    title: { fontSize: 22, fontWeight: "900", color: "#fff" },
    row: { flexDirection: "row", alignItems: "center" },
    rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    rowPad: { paddingVertical: 8 },
    text: { fontSize: 14, color: c.text },
    subtle: { fontSize: 12, color: c.muted },
    chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
    chipText: { fontSize: 12, fontWeight: "700" },
    sep: { borderTopWidth: 1, borderTopColor: c.border },
    notice: { marginTop: 10, borderRadius: 10, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 8 },
    noticeText: { fontSize: 13, fontWeight: "700" },
  });
