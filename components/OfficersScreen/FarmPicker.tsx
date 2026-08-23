import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../services/ColorPalette";
import { Ionicons } from "@expo/vector-icons";
import Farm from "../../models/Farm";
import { getAllFarms } from "../../controllers/farmController";
import { useEffect, useState } from "react";

export default function FarmPicker({
  visible,
  selected,
  onDone,
  onClose,
}: {
  visible: boolean;
  selected: Farm[];
  onDone: (farms: Farm[]) => void;
  onClose: () => void;
}) {
  const [allFarms, setAllFarms] = useState<Farm[]>([]);
  const [draft, setDraft] = useState<Farm[]>(selected);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(selected);
      loadFarms();
    }
  }, [visible]);

  const loadFarms = async () => {
    setLoading(true);
    const data = await getAllFarms();
    setAllFarms(data);
    setLoading(false);
  };

  const toggle = (farm: Farm) => {
    setDraft((prev) =>
      prev.some((f) => f.id === farm.id)
        ? prev.filter((f) => f.id !== farm.id)
        : [...prev, farm],
    );
  };

  const isSelected = (farm: Farm) => draft.some((f) => f.id === farm.id);
  if (!visible) {
    return null;
  }
  return (
    <View style={fp.overlay}>
      <TouchableOpacity
        style={fp.backdrop}
        onPress={onClose}
        activeOpacity={1}
      />

      <View style={fp.sheet}>
        <View style={fp.handle} />

        {/* Header */}
        <View style={fp.header}>
          <View>
            <Text style={fp.title}>Select Farms</Text>
            <Text style={fp.subtitle}>
              {draft.length === 0
                ? "Tap farms to assign"
                : `${draft.length} farm${draft.length !== 1 ? "s" : ""} selected`}
            </Text>
          </View>
          <TouchableOpacity style={fp.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color={Colors.SLATE500} />
          </TouchableOpacity>
        </View>

        {/* Selected count pill */}
        {draft.length > 0 && (
          <View style={fp.selectedBar}>
            <Ionicons name="checkmark-circle" size={15} color={Colors.G600} />
            <Text style={fp.selectedBarText}>
              {draft.map((f) => f.name).join(", ")}
            </Text>
          </View>
        )}

        {/* Farm list */}
        <ScrollView style={fp.list} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={fp.loadingWrap}>
              <Text style={fp.loadingText}>Loading farms...</Text>
            </View>
          ) : allFarms.length === 0 ? (
            <View style={fp.loadingWrap}>
              <Ionicons name="leaf-outline" size={32} color={Colors.G400} />
              <Text style={fp.loadingText}>No farms available</Text>
            </View>
          ) : (
            allFarms.map((farm) => {
              const sel = isSelected(farm);
              return (
                <TouchableOpacity
                  key={farm.id}
                  style={[fp.row, sel && fp.rowSelected]}
                  onPress={() => toggle(farm)}
                  activeOpacity={0.75}
                >
                  <View style={[fp.rowIcon, sel && fp.rowIconSelected]}>
                    <Ionicons
                      name="storefront-outline"
                      size={17}
                      color={sel ? Colors.WHITE : Colors.G700}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[fp.rowName, sel && fp.rowNameSelected]}>
                      {farm.name}
                    </Text>
                    <Text style={fp.rowCity}>📍 {farm.city}</Text>
                  </View>
                  <View style={[fp.checkbox, sel && fp.checkboxSelected]}>
                    {sel && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={Colors.WHITE}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Done button */}
        <View style={fp.footer}>
          <TouchableOpacity
            style={fp.clearBtn}
            onPress={() => setDraft([])}
            activeOpacity={0.8}
          >
            <Text style={fp.clearText}>Clear all</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={fp.doneBtn}
            onPress={() => onDone(draft)}
            activeOpacity={0.85}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={Colors.WHITE}
            />
            <Text style={fp.doneText}>
              Confirm {draft.length > 0 ? `(${draft.length})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const fp = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 100,
    elevation: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 0,
    maxHeight: "85%",
    zIndex: 101,
    elevation: 101,
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
    marginBottom: 14,
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
  selectedBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G200,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },
  selectedBarText: {
    flex: 1,
    fontSize: 12,
    color: Colors.G700,
    fontWeight: "600",
    lineHeight: 18,
  },
  list: {
    height: 200,
  },
  loadingWrap: { alignItems: "center", paddingVertical: 40, gap: 10 },
  loadingText: { fontSize: 14, color: Colors.SLATE500, fontWeight: "500" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: Colors.SLATE200,
    backgroundColor: Colors.WHITE,
  },
  rowSelected: { borderColor: Colors.G500, backgroundColor: Colors.G50 },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconSelected: { backgroundColor: Colors.G600 },
  rowName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.SLATE900,
    marginBottom: 2,
  },
  rowNameSelected: { color: Colors.G700 },
  rowCity: { fontSize: 12, color: Colors.SLATE500, fontWeight: "500" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.SLATE200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.WHITE,
  },
  checkboxSelected: { backgroundColor: Colors.G600, borderColor: Colors.G600 },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
  },
  clearBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: Colors.SLATE100,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
  },
  clearText: { fontSize: 14, fontWeight: "700", color: Colors.SLATE500 },
  doneBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
  doneText: { fontSize: 14, fontWeight: "800", color: Colors.WHITE },
});
