import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/navigator";
import { getUser, logout } from "../services/AuthService";
import User from "../models/User";
import Farm from "../models/Farm";
import FarmCard from "../components/Dashboard/FarmCard";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../services/ColorPalette";
import FarmDetailed from "../models/FarmDetailed";

const ASSIGNED_FARMS: FarmDetailed[] = [
  FarmDetailed.fromJson({
    id: "1",
    name: "Green Valley Farm",
    tel: "0702129283",
    city: "Kandy",
    address: "No. 123/A, North Lane, Maha Oya",
    activeChicks: 15000,
    mortalityRate: 1.2,
    avgWeight: 430,
    lastVisit: "Today",
    healthStatus: "Good",
    batchAge: 24,
    assignedTo: {
      id: "2",
      name: "Roshan",
      phone: "0782822",
      role: "officer",
    },
    feedConsumed: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),

  FarmDetailed.fromJson({
    id: "3",
    name: "Blue Ridge Poultry",
    tel: "0702129283",
    city: "Gampaha",
    address: "ABC, DEF",
    activeChicks: 4100,
    mortalityRate: 2.1,
    avgWeight: 512,
    lastVisit: "2 days ago",
    healthStatus: "Fair",
    batchAge: 31,
    feedConsumed: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),

  FarmDetailed.fromJson({
    id: "2",
    name: "Sunrise Poultry",
    tel: "0702129283",
    city: "Kurunegala",
    address: "ABC, DEF",
    activeChicks: 3200,
    mortalityRate: 1.5,
    avgWeight: 395,
    lastVisit: "Yesterday",
    healthStatus: "Good",
    batchAge: 19,
    feedConsumed: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),

  FarmDetailed.fromJson({
    id: "4",
    name: "Maha Oya Farm",
    tel: "0702129283",
    city: "Maha Oya",
    address: "ABC, DEF",
    activeChicks: 2800,
    mortalityRate: 0,
    avgWeight: 178,
    lastVisit: "3 days ago",
    healthStatus: "Poor",
    batchAge: 8,
    feedConsumed: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
];

const PAST_VISITS = [
  {
    id: "v1",
    farmName: "Green Valley Farm",
    farmCity: "Kandy",
    date: "Today, 9:14 AM",
    liveChicks: 14988,
    mortalityToday: 12,
    avgWeight: 430,
    feedConsumed: 210,
    waterConsumed: 480,
    healthStatus: "Good" as const,
    notes: "Flock looks healthy. Feed intake normal. Water lines cleaned.",
  },
  {
    id: "v2",
    farmName: "Sunrise Poultry",
    farmCity: "Kurunegala",
    date: "Yesterday, 11:30 AM",
    liveChicks: 3200,
    mortalityToday: 5,
    avgWeight: 390,
    feedConsumed: 195,
    waterConsumed: 440,
    healthStatus: "Good" as const,
    notes: "No issues. Slight humidity increase noted.",
  },
  {
    id: "v3",
    farmName: "Green Valley Farm",
    farmCity: "Kandy",
    date: "12 Jun 2026, 8:50 AM",
    liveChicks: 15000,
    mortalityToday: 3,
    avgWeight: 345,
    feedConsumed: 180,
    waterConsumed: 400,
    healthStatus: "Good" as const,
    notes: "Early stage, chicks settling well.",
  },
  {
    id: "v4",
    farmName: "Blue Ridge Poultry",
    farmCity: "Gampaha",
    date: "10 Jun 2026, 2:10 PM",
    liveChicks: 4110,
    mortalityToday: 21,
    avgWeight: 480,
    feedConsumed: 230,
    waterConsumed: 520,
    healthStatus: "Fair" as const,
    notes: "Mortality slightly elevated. Vet follow-up recommended.",
  },
];

const STATS = {
  totalVisits: 24,
  visitsThisMonth: 9,
  farms: ASSIGNED_FARMS.length,
  visitsDueToday: 2,
};

// ── Health badge ──────────────────────────────────────────
function HealthBadge({ status }: { status: "Good" | "Fair" | "Poor" }) {
  const map = {
    Good: { bg: Colors.G100, text: Colors.G900, dot: Colors.G500 },
    Fair: { bg: Colors.AMBER100, text: Colors.AMBER800, dot: Colors.AMBER500 },
    Poor: { bg: Colors.RED100, text: Colors.RED800, dot: Colors.RED500 },
  };
  const c = map[status];
  return (
    <View style={[hb.wrap, { backgroundColor: c.bg }]}>
      <View style={[hb.dot, { backgroundColor: c.dot }]} />
      <Text style={[hb.text, { color: c.text }]}>{status}</Text>
    </View>
  );
}
const hb = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: 12, fontWeight: "700" },
});

// ── Visit card ────────────────────────────────────────────
function VisitCard({ visit }: { visit: (typeof PAST_VISITS)[0] }) {
  const highMortality = visit.mortalityToday > 10;

  return (
    <TouchableOpacity style={vc.card} activeOpacity={0.75}>
      {/* Header */}
      <View style={vc.header}>
        <View style={vc.farmIconWrap}>
          <Text style={vc.farmIcon}>
            <Ionicons name="receipt" size={25} color={Colors.G900} />
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={vc.farmName}>{visit.farmName}</Text>
          <Text style={vc.meta}>
            📍 {visit.farmCity} · 🕐 {visit.date}
          </Text>
        </View>
        <HealthBadge status={visit.healthStatus} />
      </View>

      {/* Stats strip */}
      <View style={vc.strip}>
        <View style={vc.stat}>
          <Text style={vc.statVal}>{visit.avgWeight} g</Text>
          <Text style={vc.statLbl}>Avg Weight</Text>
        </View>
        <View style={vc.divider} />
        <View style={vc.stat}>
          <Text style={[vc.statVal, highMortality && { color: Colors.RED500 }]}>
            {visit.mortalityToday}
          </Text>
          <Text style={vc.statLbl}>Mortality</Text>
        </View>
        <View style={vc.divider} />
        <View style={vc.stat}>
          <Text style={vc.statVal}>{visit.feedConsumed} kg</Text>
          <Text style={vc.statLbl}>Feed</Text>
        </View>
        <View style={vc.divider} />
        <View style={vc.stat}>
          <Text style={vc.statVal}>{visit.waterConsumed} L</Text>
          <Text style={vc.statLbl}>Water</Text>
        </View>
      </View>

      {/* Notes */}
      {visit.notes ? (
        <View style={vc.noteRow}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={13}
            color={Colors.SLATE500}
          />
          <Text style={vc.noteText} numberOfLines={1}>
            {visit.notes}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const vc = StyleSheet.create({
  card: {
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
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  farmIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },
  farmIcon: { fontSize: 20 },
  farmName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.SLATE900,
    marginBottom: 2,
  },
  meta: { fontSize: 11, color: Colors.SLATE500, fontWeight: "500" },
  strip: {
    flexDirection: "row",
    backgroundColor: Colors.G50,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.G100,
    paddingVertical: 12,
  },
  stat: { flex: 1, alignItems: "center" },
  statVal: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.SLATE700,
    marginBottom: 2,
  },
  statLbl: {
    fontSize: 10,
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontWeight: "600",
  },
  divider: { width: 1, backgroundColor: Colors.G100 },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  noteText: {
    fontSize: 12,
    color: Colors.SLATE500,
    fontStyle: "italic",
    flex: 1,
  },
});

// ── Main screen ───────────────────────────────────────────
export default function OfficerHomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await getUser();
      setUser(storedUser);
    };
    loadUser();
  }, []);

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
              <Text style={s.heroNumber}>{STATS.totalVisits}</Text>
              <View style={s.heroBadge}>
                <View style={s.heroBadgeDot} />
                <Text style={s.heroBadgeText}>
                  {STATS.visitsThisMonth} this month
                </Text>
              </View>
            </View>

            {/* Right mini stats */}
            <View style={s.heroRight}>
              <View style={s.miniStat}>
                <Text style={s.miniStatValue}>{STATS.farms}</Text>
                <Text style={s.miniStatLabel}>Assigned Farms</Text>
              </View>
              <View style={s.miniStatDivider} />
              <View style={s.miniStat}>
                <Text style={[s.miniStatValue, s.amberValue]}>
                  {STATS.visitsDueToday}
                </Text>
                <Text style={s.miniStatLabel}>Due Today</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Due Today alert strip ── */}
        {STATS.visitsDueToday > 0 && (
          <View style={s.alertStrip}>
            <View style={s.alertIconWrap}>
              <Ionicons name="alert-circle" size={18} color={Colors.AMBER600} />
            </View>
            <Text style={s.alertText}>
              You have{" "}
              <Text style={s.alertBold}>
                {STATS.visitsDueToday} farm visits
              </Text>{" "}
              pending today
            </Text>
            <TouchableOpacity style={s.alertAction}>
              <Text style={s.alertActionText}>View</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Assigned Farms ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Assigned Farms</Text>

          <View style={[s.countPill, { marginRight: 4 }]}>
            <Text style={s.countText}>{ASSIGNED_FARMS.length} farms</Text>
          </View>
        </View>

        {ASSIGNED_FARMS.map((farm) => (
          <FarmCard key={farm.id} farm={farm} />
        ))}

        {/* ── Past Visits ── */}
        <View style={[s.sectionHeader, { marginTop: 10 }]}>
          <Text style={s.sectionTitle}>Past Visits</Text>
          <View style={[s.countPill, { marginRight: 4 }]}>
            <Text style={s.countText}>{PAST_VISITS.length} visits</Text>
          </View>
        </View>

        {PAST_VISITS.map((visit) => (
          <VisitCard key={visit.id} visit={visit} />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
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
