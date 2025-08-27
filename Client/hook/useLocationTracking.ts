import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import MapView from "react-native-maps";

type LatLng = { latitude: number; longitude: number };

export function useLocationTracking(mapRef: React.RefObject<MapView | null>) {
  const [myPos, setMyPos] = useState<LatLng | null>(null);
  const [tracking, setTracking] = useState(false);
  const watchSub = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setMyPos({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!tracking) {
        if (watchSub.current) {
          watchSub.current.remove();
          watchSub.current = null;
        }
        return;
      }

      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") return;

      watchSub.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 2000, distanceInterval: 5 },
        (loc) => {
          const next = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setMyPos(next);
          mapRef.current?.animateToRegion({ ...next, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 400);
        }
      );
    })();

    return () => {
      if (watchSub.current) {
        watchSub.current.remove();
        watchSub.current = null;
      }
    };
  }, [tracking, mapRef]);

  const toggleTracking = () => setTracking((t) => !t);

  return { myPos, tracking, toggleTracking };
}
