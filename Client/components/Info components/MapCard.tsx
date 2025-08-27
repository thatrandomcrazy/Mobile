import React from "react";
import { View } from "react-native";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import { useAppTheme } from "../../theme/ThemeProvider";
import { DARK_MAP_STYLE } from "../../constants/mapStyles";

export default function MapCard({
  mapRef, isDark, lat, lng, onMapPress, centerOnMe, centerOnPOI, tracking, toggleTracking,
}: {
  mapRef: React.RefObject<MapView>;
  isDark: boolean;
  lat: number;
  lng: number;
  onMapPress: (e: MapPressEvent) => void;
  centerOnMe: () => void;
  centerOnPOI: () => void;
  tracking: boolean;
  toggleTracking: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        height: 200, borderRadius: 12, borderWidth: 1, marginTop: 10,
        overflow: "hidden", position: "relative", borderColor: colors.border, backgroundColor: colors.card,
      }}
    >
      <MapView
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        customMapStyle={isDark ? DARK_MAP_STYLE : []}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={onMapPress}
        onMapReady={() => {
          mapRef.current?.fitToCoordinates([{ latitude: lat, longitude: lng }], {
            edgePadding: { top: 40, bottom: 40, left: 40, right: 40 },
            animated: true,
          });
        }}
      >
        <Marker coordinate={{ latitude: lat, longitude: lng }} />
      </MapView>

      <View style={{ position: "absolute", right: 10, bottom: 10, gap: 8 }}>
        <Fab icon="locate" onPress={centerOnMe} />
        <Fab icon="restaurant" onPress={centerOnPOI} />
        <Fab
          icon={tracking ? "pause" : "play"}
          onPress={toggleTracking}
          filled={tracking}
        />
      </View>
    </View>
  );
}

import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
function Fab({ icon, onPress, filled }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; filled?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 10, borderRadius: 10, borderWidth: 1,
        alignItems: "center", justifyContent: "center",
        backgroundColor: filled ? colors.primary : colors.card,
        borderColor: colors.border,
      }}
    >
      <Ionicons name={icon} size={18} color={filled ? "#fff" : colors.text} />
    </Pressable>
  );
}
