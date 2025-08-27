import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated?: () => void; // אופציונלי אם תרצה פעולה נוספת
  createProduct: (p: { title: string; price: number; inventory: number; image: string }) => Promise<boolean>;
};

export default function CreateProductModal({ visible, onClose, onCreated, createProduct }: Props) {
  const { colors, isDark } = useAppTheme();
  const s = useMemo(() => styles(colors, isDark), [colors, isDark]);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [inventory, setInventory] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const validateUrl = (u: string) => /^https?:\/\/.+/i.test(u.trim());

  const reset = () => {
    setTitle("");
    setPrice("");
    setInventory("");
    setImage("");
  };

  const submit = async () => {
    if (!title.trim() || !price.trim() || !image.trim()) {
      Alert.alert("Missing fields", "Title, Price, and Image URL are required.");
      return;
    }
    if (!validateUrl(image)) {
      Alert.alert("Invalid Image URL", "Provide a valid http(s) image URL.");
      return;
    }
    const priceNum = Number(price);
    const invNum = Number.isFinite(Number(inventory)) ? Number(inventory) : 0;
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      Alert.alert("Invalid Price", "Price must be a non-negative number.");
      return;
    }

    setCreating(true);
    const ok = await createProduct({
      title: title.trim(),
      price: priceNum,
      inventory: invNum,
      image: image.trim(),
    });
    setCreating(false);

    if (ok) {
      reset();
      onClose();
      onCreated?.();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Add Product</Text>

            <TextInput
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              style={s.input}
              placeholderTextColor={colors.muted}
            />
            <TextInput
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={s.input}
              placeholderTextColor={colors.muted}
            />
            <TextInput
              placeholder="Inventory"
              value={inventory}
              onChangeText={setInventory}
              keyboardType="numeric"
              style={s.input}
              placeholderTextColor={colors.muted}
            />
            <TextInput
              placeholder="Image URL (required)"
              value={image}
              onChangeText={setImage}
              autoCapitalize="none"
              style={s.input}
              placeholderTextColor={colors.muted}
            />

            {!!image ? (
              <Image source={{ uri: image }} style={s.preview} />
            ) : (
              <View style={[s.preview, s.previewPlaceholder]}>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Preview</Text>
              </View>
            )}

            <View style={[s.row, { gap: 10, marginTop: 10 }]}>
              <Pressable onPress={() => { reset(); onClose(); }} style={[s.secondaryBtn]}>
                <Text style={s.secondaryTxt}>Cancel</Text>
              </Pressable>

              <Pressable onPress={submit} style={[s.primaryBtn, { flex: 1 }, creating && { opacity: 0.7 }]} disabled={creating}>
                {creating ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryTxt}>Create</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = (c: any, isDark: boolean) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 10 },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: isDark ? "#0f1113" : "#fff",
      color: c.text,
      padding: 10,
      borderRadius: 10,
      marginBottom: 8,
    },
    preview: { width: 84, height: 84, borderRadius: 10, borderWidth: 1, borderColor: c.border, alignSelf: "flex-start" },
    previewPlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: c.background },

    primaryBtn: {
      backgroundColor: c.primary,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryTxt: { color: "#fff", fontWeight: "800" },
    secondaryBtn: {
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryTxt: { color: c.text, fontWeight: "800" },

    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      padding: 16,
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: c.card,
      borderColor: c.border,
      borderWidth: 1,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 16,
      paddingBottom: 20,
    },
    modalTitle: { color: c.text, fontWeight: "900", fontSize: 18, marginBottom: 10 },
  });
