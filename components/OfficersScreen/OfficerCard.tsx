import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../services/ColorPalette";
import Officer from "../../models/Officer";

interface Props {
  officer: Officer;
  onEdit: () => void;
  onDelete: () => void;
}

export default function OfficerCard({ officer, onEdit, onDelete }: Props) {
  const farmCount = officer.farms?.length ?? 0;
  const initials = officer.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
            <TouchableOpacity
              style={s.editBtn}
              onPress={onEdit}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={15} color={Colors.G700} />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.deleteBtn}
              onPress={onDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={15} color={Colors.RED600} />
            </TouchableOpacity>
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
});
