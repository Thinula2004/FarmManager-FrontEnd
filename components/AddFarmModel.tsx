import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../services/ColorPalette";

const OFFICERS = [
  { id: "1", name: "Roshan Perera" },
  { id: "2", name: "Nimasha Silva" },
  { id: "3", name: "Kasun Fernando" },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AddFarmModal({ visible, onClose }: Props) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [tel, setTel] = useState("");
  const [officerId, setOfficerId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedOfficer = OFFICERS.find((o) => o.id === officerId);

  const handleSubmit = () => {
    // TODO: wire up to your service
    console.log({ name, city, address, tel, officerId });
    onClose();
  };

  const reset = () => {
    setName("");
    setCity("");
    setAddress("");
    setTel("");
    setOfficerId(null);
    setDropdownOpen(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* ── Handle bar ── */}
          <View style={styles.handle} />

          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Add New Farm</Text>
              <Text style={styles.headerSub}>
                Fill in the farm details below
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                reset();
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color={Colors.SLATE500} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            <Field label="Farm Name" icon="business-outline">
              <TextInput
                style={styles.input}
                placeholder="Ex. Green Valley Farm"
                placeholderTextColor={Colors.SLATE500}
                value={name}
                onChangeText={setName}
              />
            </Field>

            <Field label="City" icon="location-outline">
              <TextInput
                style={styles.input}
                placeholder="Ex. Kandy"
                placeholderTextColor={Colors.SLATE500}
                value={city}
                onChangeText={setCity}
              />
            </Field>

            <Field label="Address" icon="map-outline">
              <TextInput
                style={[styles.input, styles.inputMulti]}
                placeholder="Street, Town, District"
                placeholderTextColor={Colors.SLATE500}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </Field>

            <Field label="Telephone" icon="call-outline">
              <TextInput
                style={styles.input}
                placeholder="07X XXX XXXX"
                placeholderTextColor={Colors.SLATE500}
                value={tel}
                onChangeText={setTel}
                keyboardType="phone-pad"
              />
            </Field>

            <Field label="Assigned To" icon="person-outline">
              <TouchableOpacity
                style={[styles.input, styles.dropdownTrigger]}
                activeOpacity={0.75}
                onPress={() => setDropdownOpen((p) => !p)}
              >
                <Text
                  style={[
                    styles.dropdownValue,
                    !selectedOfficer && { color: Colors.SLATE500 },
                  ]}
                >
                  {selectedOfficer
                    ? selectedOfficer.name
                    : "Select field officer"}
                </Text>
                <Ionicons
                  name={dropdownOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={Colors.SLATE500}
                />
              </TouchableOpacity>

              {dropdownOpen && (
                <View style={styles.dropdownList}>
                  {OFFICERS.map((o, idx) => (
                    <TouchableOpacity
                      key={o.id}
                      style={[
                        styles.dropdownItem,
                        idx < OFFICERS.length - 1 && styles.dropdownItemBorder,
                        o.id === officerId && styles.dropdownItemActive,
                      ]}
                      activeOpacity={0.75}
                      onPress={() => {
                        setOfficerId(o.id);
                        setDropdownOpen(false);
                      }}
                    >
                      <View
                        style={[
                          styles.officerAvatar,
                          o.id === officerId && styles.officerAvatarActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.officerAvatarText,
                            o.id === officerId &&
                              styles.officerAvatarTextActive,
                          ]}
                        >
                          {o.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          o.id === officerId && styles.dropdownItemTextActive,
                        ]}
                      >
                        {o.name}
                      </Text>
                      {o.id === officerId && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={Colors.G600}
                          style={{ marginLeft: "auto" }}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Field>

            <View style={{ height: 16 }} />

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.8}
                onPress={() => {
                  reset();
                  onClose();
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.85}
                onPress={handleSubmit}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={18}
                  color={Colors.WHITE}
                />
                <Text style={styles.submitText}>Add Farm</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldLabelRow}>
        <Ionicons name={icon as any} size={14} color={Colors.G600} />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

// ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  modalCard: {
    backgroundColor: Colors.G50,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: "92%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.SLATE200,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.SLATE500,
    fontWeight: "500",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.SLATE100,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.SLATE200,
    marginBottom: 20,
  },

  // ── Form ──
  formContent: {
    paddingBottom: 8,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 7,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.SLATE700,
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: Colors.WHITE,
    borderWidth: 1.5,
    borderColor: Colors.SLATE200,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.SLATE900,
    fontWeight: "500",
  },
  inputMulti: {
    height: 72,
    paddingTop: 12,
  },

  // ── Dropdown ──
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownValue: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.SLATE900,
  },
  dropdownList: {
    backgroundColor: Colors.WHITE,
    borderWidth: 1.5,
    borderColor: Colors.SLATE200,
    borderRadius: 14,
    marginTop: 6,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.SLATE200,
  },
  dropdownItemActive: {
    backgroundColor: Colors.G100,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.SLATE700,
  },
  dropdownItemTextActive: {
    color: Colors.G700,
    fontWeight: "700",
  },
  officerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.SLATE100,
    justifyContent: "center",
    alignItems: "center",
  },
  officerAvatarActive: {
    backgroundColor: Colors.G200,
  },
  officerAvatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.SLATE500,
  },
  officerAvatarTextActive: {
    color: Colors.G700,
  },

  // ── Actions ──
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.SLATE200,
    alignItems: "center",
    backgroundColor: Colors.WHITE,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.SLATE500,
  },
  submitBtn: {
    flex: 1.5,
    flexDirection: "row",
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.G600,
    borderWidth: 1,
    borderColor: Colors.G500,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: 0.2,
  },
});
