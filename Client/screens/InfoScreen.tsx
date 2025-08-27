// src/screens/InfoScreen.tsx
import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Linking,
  Platform,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";
import * as Clipboard from "expo-clipboard";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE, MapPressEvent } from "react-native-maps";

// ---------- Demo content ----------
const HERO =
  "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop";
const ADDRESS = "123 Burger St, Tel Aviv";
const LAT = 32.08088;
const LNG = 34.78057;

// ---------- Optional: dark map style ----------
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#cfcfcf" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1d1d1d" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a2a" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#bfbfbf" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#232323" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
];

export default function InfoScreen() {
  const { colors, isDark } = useAppTheme();
  const s = useMemo(() => styles(colors), [colors]);

  const mapRef = useRef<MapView>(null);

  // מצב מיקום ומעקב
  const [myPos, setMyPos] = useState<{ latitude: number; longitude: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const watchSub = useRef<Location.LocationSubscription | null>(null);

  // בקשת הרשאה + מיקום ראשוני
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setMyPos({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  // ניהול מעקב חי on/off
  useEffect(() => {
    (async () => {
      if (!tracking) {
        // כיבוי: בטל subscribed watcher אם קיים
        if (watchSub.current) {
          watchSub.current.remove();
          watchSub.current = null;
        }
        return;
      }

      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") return;

      watchSub.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 2000,        // כל 2 שניות
          distanceInterval: 5,       // או כל 5 מטר
        },
        (loc) => {
          const next = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setMyPos(next);
          // בזמן מעקב – אפשר למרכז עדין על המשתמש
          mapRef.current?.animateToRegion(
            { ...next, latitudeDelta: 0.01, longitudeDelta: 0.01 },
            400
          );
        }
      );
    })();

    // ניקוי כשעוזבים מסך/מכבים מעקב
    return () => {
      if (watchSub.current) {
        watchSub.current.remove();
        watchSub.current = null;
      }
    };
  }, [tracking]);

  // מרכוז למסעדה אחרי render
  useEffect(() => {
    const id = setTimeout(() => {
      centerOnRestaurant(false);
    }, 50);
    return () => clearTimeout(id);
  }, []);

  const centerOnMe = () => {
    if (!myPos) return;
    mapRef.current?.animateToRegion(
      { ...myPos, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500
    );
  };

  const centerOnRestaurant = (animated = true) => {
    mapRef.current?.fitToCoordinates([{ latitude: LAT, longitude: LNG }], {
      edgePadding: { top: 40, bottom: 40, left: 40, right: 40 },
      animated,
    });
  };

  const toggleTracking = () => setTracking((t) => !t);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Hero */}
        <View style={s.heroWrap}>
          <Image source={{ uri: HERO }} style={s.hero} />
          <View style={[s.heroOverlay, { backgroundColor: "rgba(0,0,0,0.25)" }]} />
          <View style={s.heroContent}>
            <View style={s.logoWrap}>
              <Text style={s.logoText}>BH</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Burger House</Text>
              <View style={s.row}>
                <Ionicons name="star" size={14} color="#ffd166" />
                <Text style={[s.subtle, { marginLeft: 4 }]}>4.7 • 1.2k ratings</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tags */}
        <Card colors={colors}>
          <View style={[s.row, { flexWrap: "wrap", gap: 8 }]}>
            {["Burgers", "Fries", "Vegan", "Gluten-Free", "Kosher"].map((t) => (
              <View key={t} style={[s.chip, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Text style={[s.chipText, { color: colors.text }]}>{t}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Address + Map */}
        <Card colors={colors}>
          <SectionHeader icon="location" title="Location" />
          <Text style={s.text}>{ADDRESS}</Text>
          <Text style={[s.subtle, { marginTop: 2 }]}>Near Habima • Parking on site</Text>

          <View
  style={[
    s.mapWrap,
    { borderColor: colors.border, backgroundColor: colors.card, height: 200 },
  ]}
>
  <MapView
    ref={mapRef}
    style={{ width: "100%", height: "100%" }}   // חשוב: גובה/רוחב מפורשים
    initialRegion={{
      latitude: LAT,
      longitude: LNG,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }}
    // אל תשים provider בכלל — כך:
    // provider={undefined}
    customMapStyle={isDark ? DARK_MAP_STYLE : []}
    showsUserLocation
    showsMyLocationButton={false}
    onPress={onMapPress}
    onMapReady={() => {
      // מרכוז בטוח כשמפה מוכנה
      mapRef.current?.fitToCoordinates([{ latitude: LAT, longitude: LNG }], {
        edgePadding: { top: 40, bottom: 40, left: 40, right: 40 },
        animated: true,
      });
    }}
  >
    <Marker
      coordinate={{ latitude: LAT, longitude: LNG }}
      title="Burger House"
      description={ADDRESS}
    />
  </MapView>

  {/* FABs על המפה */}
  <View style={s.fabCol}>
    <Pressable
      style={[s.fab, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={centerOnMe}
    >
      <Ionicons name="locate" size={18} color={colors.text} />
    </Pressable>
    <Pressable
      style={[s.fab, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => centerOnRestaurant()}
    >
      <Ionicons name="restaurant" size={18} color={colors.text} />
    </Pressable>
    <Pressable
      style={[
        s.fab,
        {
          backgroundColor: tracking ? colors.primary : colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={toggleTracking}
    >
      <Ionicons
        name={tracking ? "pause" : "play"}
        size={18}
        color={tracking ? "#fff" : colors.text}
      />
    </Pressable>
  </View>
</View>

     

          <View style={[s.row, { gap: 10, marginTop: 10 }]}>
            <ActionBtn icon="navigate" label="Directions" onPress={openDirections} />
            <ActionBtn icon="copy" label="Copy address" onPress={copyAddress} />
            <ActionBtn icon="share-social" label="Share" onPress={shareAddress} />
          </View>
        </Card>

        {/* Hours */}
        <Card colors={colors}>
          <SectionHeader icon="time" title="Opening Hours" />
          {[
            ["Sun–Thu", "10:00 – 22:00"],
            ["Fri", "10:00 – 15:00"],
            ["Sat", "Closed"],
          ].map(([d, h], i) => (
            <View key={i} style={[s.rowBetween, s.rowPad, i > 0 && s.sep]}>
              <Text style={s.text}>{d}</Text>
              <Text style={[s.text, h === "Closed" ? { color: colors.danger, fontWeight: "700" } : null]}>{h}</Text>
            </View>
          ))}
          <View style={[s.notice, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={[s.noticeText, { color: colors.text }]}>Open now • Kitchen closes 21:30</Text>
          </View>
        </Card>

        {/* Contact */}
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

        {/* Services */}
        <Card colors={colors}>
          <SectionHeader icon="bicycle" title="Services" />
          <View style={[s.row, { gap: 10, flexWrap: "wrap" }]}>
            <Pill icon="bicycle" label="Delivery" color={colors.primary} />
            <Pill icon="bag-handle" label="Take-Away" color={colors.success} />
            <Pill icon="restaurant" label="Dine-In" color={colors.primary} />
            <Pill icon="leaf" label="Vegan options" color={colors.success} />
          </View>
        </Card>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Actions ---------- */
function openDirections() {
  const query = LAT && LNG ? `${LAT},${LNG}` : encodeURIComponent(ADDRESS);
  const url = Platform.select({
    ios: `http://maps.apple.com/?daddr=${query}`,
    android: `https://www.google.com/maps/dir/?api=1&destination=${query}`,
  });
  if (url) Linking.openURL(url);
}

async function copyAddress() {
  await Clipboard.setStringAsync(ADDRESS);
}

function shareAddress() {
  Share.share({
    message: `${ADDRESS}\nhttps://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`,
  });
}

function callPhone() {
  const phone = "+972522226889";
  Linking.openURL(`tel:${phone}`);
}

function openWhatsapp() {
  const phone = "+972522226889";
  const text = "Hi Burger House!";
  const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(text)}`;
  Linking.openURL(url);
}

function sendEmail() {
  const email = "ofir071002@gmail.com";
  const subject = "Table reservation";
  const body = "Hi, I'd like to reserve a table.";
  const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  Linking.openURL(url);
}

function onMapPress(_e: MapPressEvent) {
  openDirections();
}

/* ---------- Small presentational helpers ---------- */
function Card({ colors, children }: { colors: any; children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        marginBottom: 12,
      }}
    >
      {children}
    </View>
  );
}

function SectionHeader({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
      <Ionicons name={icon} size={18} color={colors.text} />
      <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: "800", color: colors.text }}>{title}</Text>
    </View>
  );
}

function ActionBtn({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
      }}
    >
      <Ionicons name={icon} size={16} color={colors.text} />
      <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

function PrimaryBtn({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: colors.primary,
      }}
    >
      <Ionicons name={icon} size={16} color="#fff" />
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

function Pill({ icon, label, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: color }}>
      <Ionicons name={icon} size={14} color="#fff" />
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = (c: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
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
    mapWrap: { height: 200, borderRadius: 12, borderWidth: 1, marginTop: 10, overflow: "hidden", position: "relative" },
    map: { flex: 1 },
    fabCol: { position: "absolute", right: 10, bottom: 10, gap: 8 },
    fab: { padding: 10, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
    sep: { borderTopWidth: 1, borderTopColor: c.border },
    notice: { marginTop: 10, borderRadius: 10, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 8 },
    noticeText: { fontSize: 13, fontWeight: "700" },
  });
