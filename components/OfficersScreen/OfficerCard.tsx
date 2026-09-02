import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../services/ColorPalette";
import Officer from "../../models/Officer";
import Loader from "../Common/Loader";
import { useState } from "react";
import { deleteOfficer } from "../../controllers/officerController";
import {
  activateOfficer,
  deactivateOfficer,
} from "../../controllers/userController";

interface Props {
  officer: Officer;
  onEdit: () => void;
  onDelete: () => void;
}

export default function OfficerCard({ officer, onEdit, onDelete }: Props) {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const farmCount = officer.farms?.length ?? 0;

  const handleDelete = () => {
    setDeleteLoading(true);
    Alert.alert(
      "Remove Officer",
      `Are you sure you want to remove "${officer.name}"? This cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            setDeleteLoading(false);
          },
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const success = await deleteOfficer(officer.id);
            setDeleteLoading(false);
            if (success) {
              onDelete();
            }
          },
        },
      ],
    );
  };

  const handleToggle = () => {
    setToggleLoading(true);
    const isGonnaActivate = !officer.isActive;
    Alert.alert(
      isGonnaActivate ? "Activate Officer" : "Deactivate Officer",
      `Are you sure you want to ${isGonnaActivate ? "ACTIVATE" : "DEACTIVATE"} "${officer.name}"? This cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            setToggleLoading(false);
          },
        },
        {
          text: isGonnaActivate ? "Activate" : "Deactivate",
          style: isGonnaActivate ? "default" : "destructive",
          onPress: async () => {
            if (isGonnaActivate) {
              const success = await activateOfficer(officer.id);
              if (success) {
                onDelete();
              }
            } else {
              const success = await deactivateOfficer(officer.id);
              if (success) {
                onDelete();
              }
            }
            setToggleLoading(false);
          },
        },
      ],
    );
  };

  return (
    <View style={s.wrap}>
      <View style={s.body}>
        <View style={s.topRow}>
          <View style={s.iconWrap}>
            <Ionicons name="person" size={20} color={Colors.G700} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={s.name}>{officer.name}</Text>
            <View style={s.phoneRow}>
              <Ionicons name="call-outline" size={12} color={Colors.SLATE500} />
              <Text style={s.phoneText}>{officer.phone}</Text>
            </View>
          </View>

          <View style={s.actions}>
            {/* Active toggle */}
            <TouchableOpacity
              style={[s.toggle, officer.isActive ? s.toggleOn : s.toggleOff]}
              onPress={() => {
                handleToggle();
              }}
              activeOpacity={0.85}
              disabled={toggleLoading}
            >
              {toggleLoading ? (
                <Loader
                  visible
                  foreground={officer.isActive ? Colors.G700 : Colors.SLATE500}
                  background="transparent"
                />
              ) : (
                <Animated.View
                  style={[
                    s.toggleDot,
                    officer.isActive ? s.toggleDotOn : s.toggleDotOff,
                  ]}
                />
              )}
            </TouchableOpacity>

            {/* Edit */}
            <TouchableOpacity
              style={s.editBtn}
              onPress={onEdit}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={15} color={Colors.G700} />
            </TouchableOpacity>

            {/* Delete */}
            <View style={s.deleteBtn}>
              <Loader
                visible={deleteLoading}
                background={Colors.RED50}
                foreground={Colors.RED600}
              />
              <TouchableOpacity onPress={handleDelete} activeOpacity={0.8}>
                <Ionicons name="trash" size={15} color={Colors.RED600} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={s.divider} />

        {/* Assigned farms section */}
        <View style={s.farmsSection}>
          <View style={s.farmsSectionHeader}>
            <Ionicons name="leaf-outline" size={13} color={Colors.G600} />
            <Text style={s.farmsSectionLabel}>Assigned Farms</Text>
            <View style={s.farmCountBadge}>
              <Text style={s.farmCountText}>{farmCount}</Text>
            </View>
          </View>

          {farmCount === 0 ? (
            <Text style={s.noFarmsText}>No farms assigned yet</Text>
          ) : (
            <View style={s.farmTags}>
              {officer.farms.slice(0, 3).map((farm) => (
                <View key={farm.id} style={s.farmTag}>
                  <Text style={s.farmTagText} numberOfLines={1}>
                    {farm.name}
                  </Text>
                </View>
              ))}
              {farmCount > 3 && (
                <View style={[s.farmTag, s.farmTagMore]}>
                  <Text style={[s.farmTagText, s.farmTagMoreText]}>
                    +{farmCount - 3} more
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: Colors.WHITE,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  accentBar: { width: 5, backgroundColor: Colors.G600 },
  body: { flex: 1, padding: 16 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.G700,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.SLATE900,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  phoneText: { fontSize: 12, color: Colors.SLATE500, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 8 },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    overflow: "hidden",
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.RED50,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: Colors.SLATE100, marginBottom: 12 },
  farmsSection: { gap: 8 },
  farmsSectionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  farmsSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    flex: 1,
  },
  farmCountBadge: {
    backgroundColor: Colors.G100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  farmCountText: { fontSize: 11, fontWeight: "800", color: Colors.G700 },
  noFarmsText: { fontSize: 12, color: Colors.SLATE500, fontStyle: "italic" },
  farmTags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  farmTag: {
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G200,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: 160,
  },
  farmTagText: { fontSize: 12, fontWeight: "600", color: Colors.G700 },
  farmTagMore: {
    backgroundColor: Colors.SLATE100,
    borderColor: Colors.SLATE200,
  },
  farmTagMoreText: { color: Colors.SLATE500 },

  toggle: {
    width: 48,
    height: 34,
    borderRadius: 13,
    paddingHorizontal: 3,
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
  },
  toggleOn: {
    backgroundColor: Colors.G100,
    borderColor: Colors.G300,
    alignItems: "flex-end",
  },
  toggleOff: {
    backgroundColor: Colors.SLATE100,
    borderColor: Colors.SLATE200,
    alignItems: "flex-start",
  },
  toggleDot: {
    width: 25,
    height: 25,
    borderRadius: 10,
  },
  toggleDotOn: {
    backgroundColor: Colors.G600,
    ...Platform.select({
      ios: {
        shadowColor: Colors.G700,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  toggleDotOff: {
    backgroundColor: Colors.SLATE400,
  },
});
