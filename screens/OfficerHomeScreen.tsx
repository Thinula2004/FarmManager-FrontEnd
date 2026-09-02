import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Platform,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/navigator";
import { getUser, logout } from "../services/AuthService";
import User from "../models/User";
import FarmCard from "../components/Dashboard/FarmCard";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../services/ColorPalette";
import FarmDetailed from "../models/FarmDetailed";
import { getFarmsAssigned } from "../controllers/farmController";
import LoadingOverlay from "../components/Common/LoadingOverlay";
import OfficerHomeSummery from "../models/OfficerHomeSummery";
import { getOfficerHomeSummery } from "../controllers/statController";
import Visit from "../models/Visit";
import { getVisitsByOfficer } from "../controllers/visitController";
import EmptyContainer from "../components/Common/EmptyContainer";
import { VisitCard } from "../components/BatchScreen/VisitCard";
import ViewVisitOverlay from "../components/Common/ViewVisitOverlay";

// ── Main screen ───────────────────────────────────────────
export default function OfficerHomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [user, setUser] = useState<User | null>(null);
  const [farms, setFarms] = useState<FarmDetailed[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summery, setSummery] = useState<OfficerHomeSummery | null>(null);
  const [viewingVisit, setViewingVisit] = useState<Visit | null>(null);
  const hasLoadedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const firstLoad = !hasLoadedOnce.current;

      hasLoadedOnce.current = true;

      loadData(firstLoad);
      setViewingVisit(null);
    }, []),
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData(false);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const onView = (visit: Visit) => {
    setViewingVisit(visit);
  };

  const loadData = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      await loadUser();
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadUser = async () => {
    const storedUser = await getUser();

    setUser(storedUser);

    if (storedUser) {
      await loadFarms(storedUser.id);
      await loadVisits(storedUser.id);
      await loadSummery(storedUser.id);
    } else {
      setFarms([]);
    }
  };

  const loadSummery = async (userId: string) => {
    const data = await getOfficerHomeSummery(userId);
    if (data) {
      setSummery(data);
    }
  };

  const loadFarms = async (userId: string) => {
    try {
      const data = await getFarmsAssigned(userId);
      setFarms(data);
    } catch (error) {
      console.error("Failed to load farms:", error);
    }
  };

  const loadVisits = async (userId: string) => {
    const data = await getVisitsByOfficer(userId);
    setVisits(data);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.G50} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.G700}
            colors={[Colors.G700]}
          />
        }
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.dateLabel}>{today}</Text>
            <Text style={s.headerTitle}>{user?.name ?? "Loading..."}</Text>
            <Text style={s.headerSubtitle}>Field Officer</Text>
          </View>
          <TouchableOpacity
            style={s.avatarBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={s.avatarText}>{initials}</Text>
            <View style={s.avatarDot} />
          </TouchableOpacity>
        </View>

        {/* ── Hero banner ── */}
        <View style={s.heroBanner}>
          {/* decorative rings */}
          <View style={s.heroRingOuter} />
          <View style={s.heroRingInner} />

          <View style={s.heroContent}>
            {/* Big number */}
            <View style={s.heroLeft}>
              <Text style={s.heroLabel}>TOTAL FIELD VISITS</Text>
              <Text style={s.heroNumber}>{summery?.totalVisits}</Text>
              <View style={s.heroBadge}>
                <View style={s.heroBadgeDot} />
                <Text style={s.heroBadgeText}>All systems active</Text>
              </View>
            </View>

            {/* Right mini stats */}
            <View style={s.heroRight}>
              <View style={s.miniStat}>
                <Text style={s.miniStatValue}>{summery?.assignedFarms}</Text>
                <Text style={s.miniStatLabel}>Assigned Farms</Text>
              </View>
              <View style={s.miniStatDivider} />
              <View style={s.miniStat}>
                <Text style={[s.miniStatValue, s.amberValue]}>
                  {summery?.activeBatches}
                </Text>
                <Text style={s.miniStatLabel}>Active Batches</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }}></View>

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Assigned Farms</Text>

          <View style={[s.countPill, { marginRight: 4 }]}>
            <Text style={s.countText}>{farms.length} farms</Text>
          </View>
        </View>

        {farms.map((farm) => (
          <FarmCard key={farm.id} farm={farm} />
        ))}

        <View style={[s.sectionHeader, { marginTop: 10 }]}>
          <Text style={s.sectionTitle}>Your Visits</Text>
          <View style={[s.countPill, { marginRight: 4 }]}>
            <Text style={s.countText}>{visits.length} visits</Text>
          </View>
        </View>

        {visits.length > 0 ? (
          <View>
            {visits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                isLast={false}
                refresh={() => {}}
                onView={onView}
              />
            ))}
          </View>
        ) : (
          <EmptyContainer
            title="No Visits Recorded"
            body="The visits you record will appear here"
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      <LoadingOverlay visible={loading} />
      {viewingVisit && (
        <ViewVisitOverlay
          visit={viewingVisit}
          onClose={() => {
            setViewingVisit(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.G50 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.G600,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.SLATE500,
    fontWeight: "500",
    marginTop: 2,
  },
  avatarBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.G700,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    borderWidth: 3,
    borderColor: Colors.G200,
    ...Platform.select({
      ios: {
        shadowColor: Colors.G900,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  avatarText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  avatarDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.G500,
    borderWidth: 2,
    borderColor: Colors.WHITE,
  },

  // Hero banner — teal-shifted dark green to distinguish from owner screen
  heroBanner: {
    backgroundColor: Colors.G900,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    overflow: "hidden",
    minHeight: 160,
    ...Platform.select({
      ios: {
        shadowColor: Colors.G950,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  heroRingOuter: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 32,
    borderColor: "rgba(255,255,255,0.06)",
  },
  heroRingInner: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 20,
    borderColor: "rgba(255,255,255,0.09)",
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  heroLeft: { flex: 1 },
  heroLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heroNumber: {
    fontSize: 56,
    fontWeight: "900",
    color: Colors.WHITE,
    letterSpacing: -2,
    lineHeight: 60,
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.G500,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  heroRight: { alignItems: "flex-end", gap: 12, paddingBottom: 4 },
  miniStat: { alignItems: "flex-end" },
  miniStatValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: -0.5,
  },
  miniStatLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  miniStatDivider: {
    width: 36,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignSelf: "flex-end",
  },
  amberValue: { color: "#fcd34d" },

  // Alert strip
  alertStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.AMBER50,
    borderWidth: 1,
    borderColor: Colors.AMBER100,
    borderRadius: 14,
    padding: 12,
    marginBottom: 22,
  },
  alertIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.AMBER100,
    alignItems: "center",
    justifyContent: "center",
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: Colors.AMBER800,
    fontWeight: "500",
  },
  alertBold: { fontWeight: "700" },
  alertAction: {
    backgroundColor: Colors.AMBER500,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  alertActionText: { fontSize: 12, fontWeight: "700", color: Colors.WHITE },

  // Section headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitleGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.3,
  },
  countPill: {
    backgroundColor: Colors.G100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.G200,
  },
  countText: { fontSize: 12, fontWeight: "700", color: Colors.G700 },

  recordBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.G700,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.G900,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  recordBtnText: { fontSize: 13, fontWeight: "700", color: Colors.WHITE },
});
