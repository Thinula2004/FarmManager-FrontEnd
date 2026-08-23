import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../services/ColorPalette";
import Farm from "../models/Farm";
import Officer from "../models/Officer";
import OfficerCard from "../components/OfficersScreen/OfficerCard";
import OfficerFormModal, {
  OfficerFormData,
} from "../components/OfficersScreen/OfficerFormModal";
import {
  getAllOfficers,
  deleteOfficer,
} from "../controllers/officerController";

const EMPTY_FORM: OfficerFormData = {
  id: "",
  name: "",
  phone: "",
  password: "",
  farms: [],
};

export default function OfficersScreen() {
  const navigation = useNavigation();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<OfficerFormData>(EMPTY_FORM);

  const filtered = officers.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.name.toLowerCase().includes(q) || o.phone.toLowerCase().includes(q)
    );
  });

  useFocusEffect(
    useCallback(() => {
      loadOfficers();
    }, []),
  );

  const loadOfficers = async () => {
    const data = await getAllOfficers();
    setOfficers(data);
  };

  const openAdd = () => {
    setModalMode("add");
    setFormData(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (officer: Officer) => {
    setModalMode("edit");
    setFormData({
      id: officer.id,
      name: officer.name,
      phone: officer.phone,
      password: "",
      farms: officer.farms ?? [],
    });
    setModalVisible(true);
  };

  const onSave = () => {
    setModalVisible(false);
    loadOfficers();
  };

  const handleDelete = (officer: Officer) => {
    Alert.alert(
      "Remove Officer",
      `Are you sure you want to remove "${officer.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const success = await deleteOfficer(officer.id);
            if (success) loadOfficers();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.G700} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.WHITE} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.topBarTitle}>Field Officers</Text>
          <Text style={styles.topBarSub}>Manage your team</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={openAdd}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color={Colors.WHITE} />
          <Text style={styles.addBtnText}>Add Officer</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={17} color={Colors.SLATE500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or phone..."
            placeholderTextColor={Colors.SLATE500}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={17} color={Colors.SLATE500} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.countLabel}>
          {filtered.length} officer{filtered.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="people-outline" size={40} color={Colors.G400} />
            </View>
            <Text style={styles.emptyTitle}>No officers found</Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? "Try a different search term"
                : "Tap 'Add Officer' to get started"}
            </Text>
          </View>
        ) : (
          filtered.map((officer) => (
            <OfficerCard
              key={officer.id}
              officer={officer}
              onEdit={() => openEdit(officer)}
              onDelete={() => handleDelete(officer)}
            />
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <OfficerFormModal
        visible={modalVisible}
        mode={modalMode}
        initialData={formData}
        onClose={() => setModalVisible(false)}
        onSave={onSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.G50 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  topBar: {
    backgroundColor: Colors.G700,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 50,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.G900,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: -0.2,
  },
  topBarSub: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 1 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addBtnText: { fontSize: 13, fontWeight: "700", color: Colors.WHITE },
  searchWrap: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.WHITE,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
    borderWidth: 1.5,
    borderColor: Colors.SLATE200,
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.SLATE900,
    fontWeight: "500",
  },
  countRow: { paddingHorizontal: 18, paddingVertical: 10, marginTop: 10 },
  countLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  emptyState: { alignItems: "center", paddingTop: 80, paddingBottom: 40 },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.SLATE900,
    marginBottom: 8,
  },
  emptySubtitle: { fontSize: 14, color: Colors.SLATE500, textAlign: "center" },
});
