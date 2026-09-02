import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../../services/ColorPalette";
import FormField from "../Common/FormField";
import { addFarm, updateFarm } from "../../controllers/farmController";
import Loader from "../Common/Loader";

export type FarmFormData = {
  id: string;
  name: string;
  city: string;
  address: string;
  customer: string;
  tel: string;
};

interface FarmFormModalProps {
  visible: boolean;
  mode: "add" | "edit";
  initialData: FarmFormData;
  onClose: () => void;
  onSave: () => void;
}

export default function FarmFormModal({
  visible,
  mode,
  initialData,
  onClose,
  onSave,
}: FarmFormModalProps) {
  const [form, setForm] = useState<FarmFormData>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm(initialData);
    }
  }, [visible, initialData]);

  const set = (key: keyof FarmFormData) => (value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (
      !form.name.trim() ||
      !form.city.trim() ||
      !form.customer.trim() ||
      !form.address.trim() ||
      !form.tel.trim()
    ) {
      Alert.alert("Missing fields", "All the fields are required.");

      return;
    }

    setLoading(true);

    let success = undefined;

    if (mode == "edit") {
      success = await updateFarm(
        form.id,
        form.name,
        form.city,
        form.address,
        form.customer,
        form.tel,
      );
    } else {
      success = await addFarm(
        form.name,
        form.city,
        form.address,
        form.customer,
        form.tel,
      );
    }

    setLoading(false);

    if (success) {
      onSave();
      return;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {mode === "add" ? "Add New Farm" : "Edit Farm"}
              </Text>

              <Text style={styles.subtitle}>
                {mode === "add"
                  ? "Fill in the details below"
                  : "Update the farm details"}
              </Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color={Colors.SLATE500} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginTop: 4 }}
          >
            <FormField
              label="Farm Name"
              value={form.name}
              onChangeText={set("name")}
              placeholder="e.g. Green Valley Farm"
              icon="leaf-outline"
            />

            <FormField
              label="City"
              value={form.city}
              onChangeText={set("city")}
              placeholder="e.g. Kandy"
              icon="location-outline"
            />

            <FormField
              label="Address"
              value={form.address}
              onChangeText={set("address")}
              placeholder="e.g. No. 12, Main Road, Kandy"
              icon="home-outline"
            />

            <FormField
              label="Customer"
              value={form.customer}
              onChangeText={set("customer")}
              placeholder="e.g. Amal Fernando"
              icon="person-outline"
            />

            <FormField
              label="Phone Number"
              value={form.tel}
              onChangeText={set("tel")}
              placeholder="e.g. 071 234 5678"
              icon="call-outline"
              keyboardType="phone-pad"
            />

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <View style={styles.saveBtn}>
                <Loader
                  visible={loading}
                  background={Colors.G700}
                  foreground={Colors.WHITE}
                />
                <TouchableOpacity onPress={handleSave} activeOpacity={0.85}>
                  <Text style={styles.saveText}>
                    {mode === "add" ? "Add Farm" : "Save Changes"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  sheet: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 0,
    maxHeight: "90%",

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },

      android: {
        elevation: 20,
      },
    }),
  },

  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.SLATE200,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.3,
  },

  subtitle: {
    fontSize: 13,
    color: Colors.SLATE500,
    marginTop: 2,
  },

  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.SLATE100,
    alignItems: "center",
    justifyContent: "center",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: Colors.SLATE100,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.SLATE500,
  },

  saveBtn: {
    flex: 2,
    overflow: "hidden",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.G700,

    ...Platform.select({
      ios: {
        shadowColor: Colors.G900,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },

      android: {
        elevation: 5,
      },
    }),
  },

  saveText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.WHITE,
  },
});
