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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../services/ColorPalette";
import Farm from "../../models/Farm";
import FormField from "../Common/FormField";
import { addOfficer, updateOfficer } from "../../controllers/officerController";
import { getAllFarms } from "../../controllers/farmController";
import FarmPicker from "./FarmPicker";
import { showToast } from "../../services/Util";
import Loader from "../Common/Loader";

export type OfficerFormData = {
  id: string;
  name: string;
  phone: string;
  password: string;
  farms: Farm[];
};

interface Props {
  visible: boolean;
  mode: "add" | "edit";
  initialData: OfficerFormData;
  onClose: () => void;
  onSave: () => void;
}

export default function OfficerFormModal({
  visible,
  mode,
  initialData,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<OfficerFormData>(initialData);
  const [farmPickerVisible, setFarmPickerVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm(initialData);
      setShowPassword(false);
    }
  }, [visible, initialData]);

  const set = (key: keyof OfficerFormData) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      showToast("error", "Name and phone are required.");
      return;
    }
    if (mode === "add" && !form.password.trim()) {
      showToast("error", "Password is required for new officers.");
      return;
    }
    if (mode === "add" && form.password.length < 4) {
      showToast("error", "Password must be at least 4 characters.");
      return;
    }

    setLoading(true);

    let success: boolean | undefined;
    if (mode === "edit") {
      success = await updateOfficer(
        form.id,
        form.name,
        form.phone,
        form.password,
        form.farms,
      );
    } else {
      success = await addOfficer(
        form.name,
        form.phone,
        form.password,
        form.farms,
      );
    }
    setLoading(false);
    if (success) onSave();
  };

  const farmCount = form.farms.length;

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={m.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity style={m.backdrop} onPress={onClose} />
          <View style={m.sheet}>
            <View style={m.handle} />

            {/* Header */}
            <View style={m.header}>
              <View>
                <Text style={m.title}>
                  {mode === "add" ? "Add New Officer" : "Edit Officer"}
                </Text>
                <Text style={m.subtitle}>
                  {mode === "add"
                    ? "Fill in the details below"
                    : "Update officer details"}
                </Text>
              </View>
              <TouchableOpacity style={m.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={18} color={Colors.SLATE500} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ marginTop: 4 }}
            >
              <FormField
                label="Full Name"
                value={form.name}
                onChangeText={set("name")}
                placeholder="e.g. Kamal Perera"
                icon="person-outline"
              />
              <FormField
                label="Phone Number"
                value={form.phone}
                onChangeText={set("phone")}
                placeholder="e.g. 071 234 5678"
                icon="call-outline"
                keyboardType="phone-pad"
              />

              {/* Password field with show/hide */}
              <View style={m.fieldGroup}>
                <Text style={m.fieldLabel}>
                  {mode === "edit" ? "New Password (optional)" : "Password"}
                </Text>
                <View style={m.passwordRow}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color={Colors.SLATE500}
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    style={m.passwordInput}
                    value={form.password}
                    onChangeText={set("password")}
                    placeholder={
                      mode === "edit"
                        ? "Leave blank to keep current"
                        : "Enter password"
                    }
                    placeholderTextColor={Colors.SLATE500}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    style={m.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={17}
                      color={Colors.SLATE500}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Farm selector */}
              <View style={m.fieldGroup}>
                <Text style={m.fieldLabel}>Assigned Farms</Text>
                <TouchableOpacity
                  style={m.farmSelector}
                  onPress={() => setFarmPickerVisible(true)}
                  activeOpacity={0.8}
                >
                  <View style={m.farmSelectorLeft}>
                    <Ionicons
                      name="leaf-outline"
                      size={16}
                      color={farmCount > 0 ? Colors.G700 : Colors.SLATE500}
                      style={{ marginRight: 10 }}
                    />
                    {farmCount === 0 ? (
                      <Text style={m.farmSelectorPlaceholder}>
                        Tap to assign farms
                      </Text>
                    ) : (
                      <View style={m.farmTagsInline}>
                        {form.farms.slice(0, 2).map((f) => (
                          <View key={f.id} style={m.inlineTag}>
                            <Text style={m.inlineTagText} numberOfLines={1}>
                              {f.name}
                            </Text>
                          </View>
                        ))}
                        {farmCount > 2 && (
                          <View style={[m.inlineTag, m.inlineTagMore]}>
                            <Text style={m.inlineTagMoreText}>
                              +{farmCount - 2}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                  <View style={m.farmSelectorRight}>
                    {farmCount > 0 && (
                      <View style={m.farmCountBadge}>
                        <Text style={m.farmCountBadgeText}>{farmCount}</Text>
                      </View>
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={Colors.SLATE500}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Actions */}
              <View style={m.actions}>
                <TouchableOpacity
                  style={m.cancelBtn}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={m.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <View style={m.saveBtn}>
                  <Loader
                    visible={loading}
                    background={Colors.G700}
                    foreground={Colors.WHITE}
                  />
                  <TouchableOpacity onPress={handleSave} activeOpacity={0.85}>
                    <Text style={m.saveText}>
                      {mode === "add" ? "Add Officer" : "Save Changes"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
          <FarmPicker
            visible={farmPickerVisible}
            selected={form.farms}
            onDone={(farms) => {
              setForm((f) => ({ ...f, farms: farms }));
              setFarmPickerVisible(false);
            }}
            onClose={() => setFarmPickerVisible(false)}
          />
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const m = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
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
    maxHeight: "92%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 20 },
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
  subtitle: { fontSize: 13, color: Colors.SLATE500, marginTop: 2 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.SLATE100,
    alignItems: "center",
    justifyContent: "center",
  },

  // Password
  fieldGroup: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.SLATE100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.SLATE200,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.SLATE900,
  },
  eyeBtn: { padding: 4 },

  // Farm selector
  farmSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.SLATE100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.SLATE200,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 50,
  },
  farmSelectorLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  farmSelectorPlaceholder: {
    fontSize: 14,
    color: Colors.SLATE500,
    fontWeight: "500",
  },
  farmTagsInline: { flexDirection: "row", flexWrap: "wrap", gap: 5, flex: 1 },
  inlineTag: {
    backgroundColor: Colors.G100,
    borderWidth: 1,
    borderColor: Colors.G200,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: 120,
  },
  inlineTagText: { fontSize: 11, fontWeight: "700", color: Colors.G700 },
  inlineTagMore: {
    backgroundColor: Colors.SLATE100,
    borderColor: Colors.SLATE200,
  },
  inlineTagMoreText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.SLATE500,
  },
  farmSelectorRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 8,
  },
  farmCountBadge: {
    backgroundColor: Colors.G700,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  farmCountBadgeText: { fontSize: 10, fontWeight: "800", color: Colors.WHITE },

  // Actions
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: Colors.SLATE100,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
  },
  cancelText: { fontSize: 14, fontWeight: "700", color: Colors.SLATE500 },
  saveBtn: {
    overflow: "hidden",
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.G700,
    ...Platform.select({
      ios: {
        shadowColor: Colors.G900,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 5 },
    }),
  },
  saveText: { fontSize: 14, fontWeight: "800", color: Colors.WHITE },
});
