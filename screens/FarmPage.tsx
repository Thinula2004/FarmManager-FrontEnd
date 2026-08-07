import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/navigator";
import { Ionicons } from "@expo/vector-icons";
import HealthBadge from "../components/HealthBadge";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../services/ColorPalette";
import { useEffect, useState } from "react";
import User from "../models/User";
import { getUser } from "../services/AuthService";

// ── Dummy field visits ────────────────────────────────────
const DUMMY_VISITS = [
  {
    id: "v1",
    date: "10 Jun 2026",
    liveChicks: 4988,
    mortalityToday: 12,
    avgWeight: 430,
    feedConsumed: 210,
    feedType: "Grower",
    waterConsumed: 480,
    healthStatus: "Good" as const,
    notes: "Flock looks healthy. Feed intake normal. Water lines cleaned.",
    officer: "Kamal Perera",
  },
  {
    id: "v2",
    date: "7 Jun 2026",
    liveChicks: 5000,
    mortalityToday: 5,
    avgWeight: 390,
    feedConsumed: 195,
    feedType: "Starter",
    waterConsumed: 440,
    healthStatus: "Good" as const,
    notes: "No issues. Slight humidity increase noted.",
    officer: "Kamal Perera",
  },
  {
    id: "v3",
    date: "4 Jun 2026",
    liveChicks: 5005,
    mortalityToday: 3,
    avgWeight: 345,
    feedConsumed: 180,
    feedType: "Grower",
    waterConsumed: 400,
    healthStatus: "Good" as const,
    notes: "Early stage, chicks settling well.",
    officer: "Nimal Silva",
  },
];

// ── Vitals bar item ───────────────────────────────────────
function VitalItem({
  label,
  value,
  unit,
  color,
  bg,
}: {
  label: string;
  value: string;
  unit?: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[vital.item, { backgroundColor: bg }]}>
      <Text style={[vital.value, { color }]}>
        {value}
        {unit ? <Text style={vital.unit}> {unit}</Text> : null}
      </Text>
      <Text style={vital.label}>{label}</Text>
    </View>
  );
}
const vital = StyleSheet.create({
  item: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-around",
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 7,
  },
  unit: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});

// ── Info chip (2-col grid) ─────────────────────────────────
function InfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={chip.wrap}>
      <View style={chip.iconWrap}>
        <Ionicons name={icon} size={16} color={Colors.G700} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={chip.label}>{label}</Text>
        <Text style={chip.value} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}
const chip = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    padding: 12,
    flex: 1,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.G50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.G100,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.SLATE700,
    lineHeight: 17,
  },
});

// ── Visit card (logbook style) ────────────────────────────
function VisitCard({
  visit,
  index,
  onPress,
}: {
  visit: (typeof DUMMY_VISITS)[0];
  index: number;
  onPress: () => void;
}) {
  const isLast = index === DUMMY_VISITS.length - 1;
  const mortalityHigh = visit.mortalityToday > 10;

  return (
    <View style={lv.wrapper}>
      {/* Timeline spine */}
      <View style={lv.spine}>
        <View style={lv.dot} />
        {!isLast && <View style={lv.line} />}
      </View>

      {/* Card body */}
      <TouchableOpacity style={lv.card} onPress={onPress} activeOpacity={0.75}>
        {/* Header */}
        <View style={lv.header}>
          <View>
            <Text style={lv.date}>{visit.date}</Text>
            <View style={lv.officerRow}>
              <Ionicons
                name="person-circle-outline"
                size={13}
                color={Colors.SLATE500}
              />
              <Text style={lv.officer}>{visit.officer}</Text>
            </View>
          </View>
          <HealthBadge status={visit.healthStatus} />
        </View>

        {/* Metrics grid */}
        <View style={lv.grid}>
          <View style={lv.metricCell}>
            <Text style={lv.metricVal}>{visit.avgWeight}g</Text>
            <Text style={lv.metricLbl}>Avg Weight</Text>
          </View>
          <View style={lv.metricDivider} />
          <View style={lv.metricCell}>
            <Text
              style={[lv.metricVal, mortalityHigh && { color: Colors.RED600 }]}
            >
              {visit.mortalityToday}
            </Text>
            <Text style={lv.metricLbl}>Mortality</Text>
          </View>
          <View style={lv.metricDivider} />
          <View style={lv.metricCell}>
            <Text style={lv.metricVal}>{visit.feedConsumed}kg</Text>
            <Text style={lv.metricLbl}>Feed</Text>
          </View>
          <View style={lv.metricDivider} />
          <View style={lv.metricCell}>
            <Text style={lv.metricVal}>{visit.waterConsumed}L</Text>
            <Text style={lv.metricLbl}>Water</Text>
          </View>
        </View>

        {/* Feed type tag + notes */}
        <View style={lv.footer}>
          <View style={lv.feedTag}>
            <Ionicons name="leaf-outline" size={11} color={Colors.G700} />
            <Text style={lv.feedTagText}>{visit.feedType}</Text>
          </View>
          {visit.notes ? (
            <Text style={lv.notes} numberOfLines={1}>
              {visit.notes}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
}
const lv = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  // Timeline
  spine: {
    alignItems: "center",
    width: 18,
    paddingTop: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.G700,
    borderWidth: 2,
    borderColor: Colors.G200,
    zIndex: 1,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.G200,
    marginTop: 4,
    marginBottom: -4,
  },
  // Card
  card: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    marginBottom: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  date: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.SLATE900,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  officerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  officer: {
    fontSize: 11,
    color: Colors.SLATE500,
    fontWeight: "500",
  },
  // Metrics strip
  grid: {
    flexDirection: "row",
    backgroundColor: Colors.G50,
    borderTopWidth: 1,
    borderColor: Colors.G100,
    paddingVertical: 11,
  },
  metricCell: { flex: 1, alignItems: "center" },
  metricVal: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.SLATE900,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  metricLbl: {
    fontSize: 9,
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontWeight: "600",
  },
  metricDivider: { width: 1, backgroundColor: Colors.G200 },
  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderColor: Colors.SLATE200,
  },
  feedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.G100,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.G200,
  },
  feedTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.G900,
  },
  notes: {
    flex: 1,
    fontSize: 11,
    color: Colors.SLATE500,
    fontStyle: "italic",
  },
});

// ── Section header ────────────────────────────────────────
function SectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      {badge ? (
        <View style={sh.pill}>
          <Text style={sh.pillText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}
const sh = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.3,
  },
  pill: {
    backgroundColor: Colors.G100,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.G200,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.G700,
  },
});

// ── Main screen ───────────────────────────────────────────
type Props = NativeStackScreenProps<RootStackParamList, "Farm">;
export default function FarmPage({ route }: Props) {
  const { farm } = route.params;
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.G950} />

      {/* ── Hero header ── */}
      <View style={styles.hero}>
        {/* Decorative rings */}
        <View style={styles.ringA} />
        <View style={styles.ringB} />

        {/* Nav row */}
        <View style={styles.heroNav}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.WHITE} />
          </TouchableOpacity>
          {user?.role == "owner" && (
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
              <Ionicons name="pencil" size={13} color={Colors.WHITE} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Farm identity */}
        <View style={styles.heroBody}>
          <View style={styles.heroLeft}>
            <View style={{ width: 100, alignItems: "baseline" }}>
              <HealthBadge status={farm.healthStatus} />
            </View>
            <Text style={styles.heroFarmName} numberOfLines={2}>
              {farm.name}
            </Text>
            <View style={styles.heroMeta}>
              <Ionicons name="location" size={12} color={Colors.G400} />
              <Text style={styles.heroCity}>{farm.city}</Text>
              <View style={styles.heroDot} />
              <Ionicons name="time-outline" size={12} color={Colors.G400} />
              <Text style={styles.heroCity}>{farm.lastVisit}</Text>
            </View>
          </View>

          {/* Batch day ring */}
          <View style={styles.batchBadge}>
            <Text style={styles.batchDay}>{farm.batchAge}</Text>
            <Text style={styles.batchDayLabel}>DAY</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Vitals strip ── */}
        <View style={styles.vitalsStrip}>
          <VitalItem
            label="Live Chicks"
            value={farm.activeChicks.toLocaleString()}
            color={Colors.G700}
            bg={Colors.G50}
          />
          <VitalItem
            label="Avg Weight"
            value={`${farm.avgWeight}`}
            unit="g"
            color={Colors.G700}
            bg={Colors.G50}
          />
          <VitalItem
            label="Mortality"
            value={`${farm.mortalityRate}`}
            unit="%"
            color={Colors.RED600}
            bg={Colors.RED50}
          />
          <VitalItem
            label="Feed"
            value={`${farm.feedConsumed}`}
            unit="kg"
            color={Colors.AMBER600}
            bg={Colors.AMBER50}
          />
        </View>

        {/* ── Farm Details ── */}
        <SectionHeader title="Farm Details" />
        <View style={styles.chipGrid}>
          <InfoChip icon="call-outline" label="Contact" value={farm.tel} />
          <InfoChip
            icon="person-outline"
            label="Assigned To"
            value={farm.assignedTo ? farm.assignedTo.name : "Unassigned"}
          />
        </View>
        <View style={[styles.chipGrid, { marginTop: 10 }]}>
          <InfoChip icon="location-outline" label="City" value={farm.city} />
          <InfoChip
            icon="calendar-outline"
            label="Last Visit"
            value={farm.lastVisit}
          />
        </View>
        <View style={[styles.chipGrid, { marginTop: 10 }]}>
          <InfoChip
            icon="navigate-outline"
            label="Address"
            value={farm.address}
          />
        </View>

        {/* ── Field Visits ── */}
        <View style={styles.visitsSectionHeader}>
          <SectionHeader
            title="Field Visits"
            badge={`${DUMMY_VISITS.length} visits`}
          />
          {/* <TouchableOpacity style={s.logVisitBtn} activeOpacity={0.8}>
            <Ionicons name="add" size={16} color={WHITE} />
            <Text style={s.logVisitText}>Log Visit</Text>
          </TouchableOpacity> */}
        </View>

        <View style={styles.timelineWrap}>
          {DUMMY_VISITS.map((visit, index) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              index={index}
              onPress={() => {}}
            />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      {user?.role == "officer" && (
        <TouchableOpacity style={styles.fab} onPress={() => {}}>
          <Text style={styles.fabText}>Record a Visit</Text>
          <Ionicons
            style={{ marginBottom: 3 }}
            name="create-outline"
            size={23}
            color="white"
          />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.G50 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 40,
  },

  // ── Hero ────────────────────────────────────────────────
  hero: {
    backgroundColor: Colors.G900,
    paddingHorizontal: 18,
    paddingTop: 52,
    paddingBottom: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: Colors.G950,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: { elevation: 10 },
    }),
  },
  ringA: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 36,
    borderColor: "rgba(255,255,255,0.05)",
  },
  ringB: {
    position: "absolute",
    bottom: -50,
    right: 40,
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 24,
    borderColor: "rgba(34,197,94,0.12)",
  },

  // Nav row inside hero
  heroNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editBtnText: {
    fontSize: 13,
    color: Colors.WHITE,
    fontWeight: "700",
  },

  // Hero body
  heroBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  heroLeft: {
    flex: 1,
    gap: 8,
  },
  heroFarmName: {
    fontSize: 26,
    fontWeight: "900",
    color: Colors.WHITE,
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  heroCity: {
    fontSize: 12,
    color: Colors.G400,
    fontWeight: "500",
  },
  heroDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.G500,
    opacity: 0.6,
    marginHorizontal: 2,
  },

  // Batch day badge
  batchBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: Colors.G500,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  batchDay: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.WHITE,
    lineHeight: 24,
    letterSpacing: -1,
  },
  batchDayLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.G400,
    letterSpacing: 1.5,
    marginTop: 1,
  },

  // ── Vitals strip ─────────────────────────────────────────
  vitalsStrip: {
    flexDirection: "row",
    gap: 8,
    marginTop: -1,
    marginHorizontal: -18,
    paddingHorizontal: 10,
    paddingVertical: 16,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.SLATE200,
    marginBottom: 24,
  },

  // ── Info chip grid ────────────────────────────────────────
  chipGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 0,
  },

  // ── Visits section header ─────────────────────────────────
  visitsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 0,
  },
  logVisitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.G700,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: Colors.G900,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  logVisitText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.WHITE,
  },

  // ── Timeline wrapper ──────────────────────────────────────
  timelineWrap: {
    paddingLeft: 4,
  },

  fab: {
    flexDirection: "row",
    gap: 20,
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    paddingHorizontal: 40,
    height: 50,
    borderRadius: 10,
    backgroundColor: Colors.G700,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.G700,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: { elevation: 5 },
    }),
  },

  fabText: {
    color: Colors.WHITE,
    fontWeight: "600",
    fontSize: 18,
  },
});
