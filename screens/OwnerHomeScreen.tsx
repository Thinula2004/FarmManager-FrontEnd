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
import User from "../models/User";
import { getUser } from "../services/AuthService";
import Farm from "../models/Farm";
import FarmCard from "../components/FarmCard";
import StatCard from "../components/StatCard";
import AddFarmModal from "../components/AddFarmModel";
import { Ionicons } from "@expo/vector-icons";

const FARMS = [
  new Farm(
    "1",
    "Green Valley Farm",
    "0702129283",
    "Kandy",
    "No. 123/A, North Lane, Maha Oya",
    15000,
    1.2,
    430,
    "Today",
    "Good",
    24,
    new User("2", "Roshan", "0782822", "officer"),
  ),
  new Farm(
    "3",
    "Blue Ridge Poultry",
    "0702129283",
    "Gampaha",
    "ABC, DEF",
    4100,
    2.1,
    512,
    "2 days ago",
    "Fair",
    31,
  ),
  new Farm(
    "2",
    "Sunrise Poultry",
    "0702129283",
    "Kurunegala",
    "ABC, DEF",
    3200,
    1.5,
    395,
    "Yesterday",
    "Good",
    19,
  ),
  new Farm(
    "4",
    "Maha Oya Farm",
    "0702129283",
    "Maha Oya",
    "ABC, DEF",
    2800,
    0,
    178,
    "3 days ago",
    "Poor",
    8,
  ),
];

const SUMMARY = {
  totalFarms: 4,
  totalChicks: 15100,
  mortalityToday: 38,
  avgWeight: 379,
};

// ── Palette ──────────────────────────────────────────────
const G950 = "#052e16"; // ultra-dark green for text on light green
const G900 = "#14532D";
const G700 = "#15803D"; // brand green
const G600 = "#16a34a";
const G500 = "#22C55E";
const G200 = "#bbf7d0";
const G100 = "#DCFCE7";
const G50 = "#F0FDF4"; // page background

const SLATE900 = "#0f172a"; // primary headings
const SLATE700 = "#1E293B"; // primary text
const SLATE500 = "#64748B"; // secondary/muted text
const SLATE200 = "#e2e8f0"; // dividers / borders
const SLATE100 = "#f1f5f9"; // subtle surface

const RED500 = "#ef4444";
const RED100 = "#fee2e2";
const RED800 = "#991b1b";

const AMBER500 = "#f59e0b";
const AMBER100 = "#fef3c7";
const AMBER800 = "#92400e";

const WHITE = "#FFFFFF";

// ─────────────────────────────────────────────────────────

export default function OwnerHomeScreen() {
  const [showFarmModal, setShowFarmModal] = useState(false);
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
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={G50} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.dateLabel}>{today}</Text>
            <Text style={styles.headerTitle}>{user?.name ?? "Loading..."}</Text>
            <Text style={styles.headerSubtitle}>Farm Overview</Text>
          </View>

          <TouchableOpacity
            style={styles.avatarBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.avatarText}>{initials}</Text>
            {/* Online indicator dot */}
            <View style={styles.avatarDot} />
          </TouchableOpacity>
        </View>

        {/* ── Hero Banner ── */}
        <View style={styles.heroBanner}>
          <View style={styles.heroRingOuter} />
          <View style={styles.heroRingInner} />

          <View style={styles.heroContent}>
            {/* Left: hero stat */}
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>LIVE CHICKS</Text>
              <Text style={styles.heroNumber}>
                {SUMMARY.totalChicks.toLocaleString()}
              </Text>
              <View style={styles.heroBadge}>
                <View style={styles.heroBadgeDot} />
                <Text style={styles.heroBadgeText}>All systems active</Text>
              </View>
            </View>

            {/* Right: supporting stats */}
            <View style={styles.heroRight}>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatValue}>{SUMMARY.totalFarms}</Text>
                <Text style={styles.miniStatLabel}>Farms</Text>
              </View>
              <View style={styles.miniStatDivider} />
              <View style={styles.miniStat}>
                <Text style={[styles.miniStatValue, styles.redValue]}>
                  {SUMMARY.mortalityToday}
                </Text>
                <Text style={styles.miniStatLabel}>Deaths Today</Text>
              </View>
              <View style={styles.miniStatDivider} />
              <View style={styles.miniStat}>
                <Text style={styles.miniStatValue}>{SUMMARY.avgWeight}g</Text>
                <Text style={styles.miniStatLabel}>Avg Weight</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Section Header ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleGroup}>
            <Text style={styles.sectionTitle}>Your Farms</Text>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{FARMS.length} active</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.8}
            onPress={() => setShowFarmModal(true)}
          >
            <Ionicons name="add" size={22} color={WHITE} />
          </TouchableOpacity>
        </View>

        {/* ── Farm Cards ── */}
        {FARMS.map((farm) => (
          <FarmCard key={farm.id} farm={farm} />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      <AddFarmModal
        visible={showFarmModal}
        onClose={() => setShowFarmModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: G50,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // ── Header ──────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  headerLeft: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: G600,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: SLATE900,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontSize: 14,
    color: SLATE500,
    fontWeight: "500",
    marginTop: 2,
  },
  avatarBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: G700,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    // Green glow ring
    borderWidth: 3,
    borderColor: G200,
    ...Platform.select({
      ios: {
        shadowColor: G900,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  avatarText: {
    color: WHITE,
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
    backgroundColor: G500,
    borderWidth: 2,
    borderColor: WHITE,
  },

  // ── Hero Banner ──────────────────────────────────────────
  heroBanner: {
    backgroundColor: G700,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    overflow: "hidden",
    minHeight: 160,
    ...Platform.select({
      ios: {
        shadowColor: G900,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  // Decorative rings layered behind content
  heroRingOuter: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 32,
    borderColor: "rgba(255,255,255,0.07)",
  },
  heroRingInner: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 20,
    borderColor: "rgba(255,255,255,0.1)",
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  heroLeft: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heroNumber: {
    fontSize: 48,
    fontWeight: "900",
    color: WHITE,
    letterSpacing: -2,
    lineHeight: 52,
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: G500,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  heroRight: {
    alignItems: "flex-end",
    gap: 10,
    paddingBottom: 4,
  },
  miniStat: {
    alignItems: "flex-end",
  },
  miniStatValue: {
    fontSize: 20,
    fontWeight: "800",
    color: WHITE,
    letterSpacing: -0.5,
  },
  miniStatLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.55)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  miniStatDivider: {
    width: 36,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-end",
  },
  redValue: {
    color: "#ff9191", // soft red that reads well on dark green
  },

  // ── Section header ───────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: SLATE900,
    letterSpacing: -0.3,
  },
  countPill: {
    backgroundColor: G100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: G200,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: G700,
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: G700,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: G900,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
});
