import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  inventory: number; 
}

interface Props {
  item: Product;
  onPress: () => void;
}

const isValidUri = (s?: string) =>
  !!s &&
  (/^https?:\/\//i.test(s.trim()) ||
    /^data:image\/[a-zA-Z+]+;base64,/i.test(s.trim()) ||
    /^file:\/\//i.test(s.trim()));

const PLACEHOLDER = "https://via.placeholder.com/300x300?text=No+Image";

export default function ProductCard({ item, onPress }: Props) {
  const [broken, setBroken] = useState(false);
  const [loadingImg, setLoadingImg] = useState(true);
  const fade = useMemo(() => new Animated.Value(0), []);
  const isOut = item.inventory === 0;

  const uri = useMemo(() => {
    const src = (item.image || "").trim();
    if (broken) return PLACEHOLDER;
    if (isValidUri(src)) return src;
    return PLACEHOLDER;
  }, [item.image, broken]);

  const onLoadEnd = () => {
    setLoadingImg(false);
    Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  };

  return (
    <Pressable
      disabled={isOut}
      onPress={onPress}
      android_ripple={{ color: "rgba(0,0,0,0.06)" }}
      style={({ pressed }) => [
        styles.card,
        pressed && !isOut && styles.cardPressed,
        Platform.OS === "android" ? styles.elevated : styles.shadow,
        isOut && styles.cardDisabled,
      ]}
    >
      <View style={styles.imageWrap}>
        {loadingImg && (
          <View style={styles.loader}>
            <ActivityIndicator />
          </View>
        )}

        <Animated.Image
          source={{ uri }}
          style={[styles.image, { opacity: fade }]}
          onError={() => setBroken(true)}
          onLoadEnd={onLoadEnd}
          resizeMode="cover"
        />

        {isOut && (
          <>
            <View style={styles.dim} />
            <View style={styles.ribbon}>
              <Text style={styles.ribbonText}>Out of stock
</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.rowBetween}>
          <View style={[styles.pricePill, isOut && { backgroundColor: "#9ca3af" }]}>
            <Ionicons name="pricetag" size={14} color="#fff" />
            <Text style={styles.priceText}>₪{item.price}</Text>
          </View>

          {isOut ? (
            <View style={styles.outPill}>
              <Text style={styles.outPillText}>אזל מהמלאי</Text>
            </View>
          ) : (
            <Pressable
              onPress={onPress}
              style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            >
              <Ionicons name="information-circle" size={16} color="#fff" />
              <Text style={styles.btnText}>Details</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 14,
    marginHorizontal: 14,
    marginVertical: 9,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: "#ececec",
  },
  cardPressed: {
    transform: [{ scale: 0.995 }],
    opacity: 0.98,
  },
  cardDisabled: {
    opacity: 0.85,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  elevated: {
    elevation: 2,
  },

  imageWrap: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f6f6f6",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  ribbon: {
    position: "absolute",
    bottom: 6,
    left: 6,
    right: 6,
    backgroundColor: "#111827",
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  ribbonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.3,
  },

  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 2,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    lineHeight: 20,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pricePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "tomato",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  priceText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.2,
  },

  outPill: {
    backgroundColor: "#9ca3af",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  outPillText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
