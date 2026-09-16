import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Pressable,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { navigateFromStack, RootStackParamList } from "../navigation/navigator";
import { Ionicons } from "@expo/vector-icons";
import HealthBadge from "../components/Common/HealthBadge";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../services/ColorPalette";
import { useCallback, useEffect, useRef, useState } from "react";
import User from "../models/User";
import { getUser } from "../services/AuthService";
import { getTimeSince, showToast } from "../services/Util";
import SectionHeader from "../components/FarmScreen/SectionHeader";
import VitalItem from "../components/FarmScreen/VitalItem";
import InfoChip from "../components/FarmScreen/InfoChip";
import Batch from "../models/Batch";
import BatchCard from "../components/FarmScreen/BatchCard";
import { deleteBatch, getAllBatches } from "../controllers/batchController";
import EmptyContainer from "../components/Common/EmptyContainer";
import LoadingOverlay from "../components/Common/LoadingOverlay";
import AddBatchOverlay from "../components/FarmScreen/AddBatchOverlay";

type Props = NativeStackScreenProps<RootStackParamList, "Farm">;
export default function FarmScreen({ route }: Props) {
  const { farm } = route.params;
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);
  const [actionsExpanded, setActionsExpanded] = useState(false);
  const [addBatchVisible, setAddBatchVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const firstLoad = !hasLoadedOnce.current;

      hasLoadedOnce.current = true;

      loadData(firstLoad);
    }, []),
  );

  const loadData = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      await Promise.all([loadBatches()]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

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

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  const loadBatches = async () => {
    const data = await getAllBatches(farm.id);
    setBatches(data);
  };

  const onDeleteBatch = async (batchId: string) => {
    const success = await deleteBatch(batchId);
    if (success) {
      showToast("success", "Batch Deleted Successfully");
      loadData();
    }
  };

  function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    const initials =
      parts.length > 1
        ? parts[0][0] + parts[parts.length - 1][0]
        : (parts[0]?.[0] ?? "");
    return initials.toUpperCase();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.G950} />

      <View style={styles.hero}>
        <View style={styles.heroDecoration} pointerEvents="none">
          <View style={styles.ringA} />
          <View style={styles.ringB} />
        </View>

        <View style={styles.heroNav}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.WHITE} />
          </TouchableOpacity>
          {user?.role == "owner" && (
            <View style={styles.actionWrapper}>
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.8}
                onPress={() => setActionsExpanded((prev) => !prev)}
              >
                <Text style={styles.actionBtnText}>Action</Text>

                <Ionicons
                  name={
                    actionsExpanded ? "caret-up-outline" : "caret-down-outline"
                  }
                  size={13}
                  color={Colors.WHITE}
                />
              </TouchableOpacity>

              {actionsExpanded && (
                <View style={styles.actionDropdown}>
                  <TouchableOpacity
                    style={styles.actionItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setActionsExpanded(false);
                      navigateFromStack("Farms");
                    }}
                  >
                    <Ionicons
                      name="create-outline"
                      size={16}
                      color={Colors.WHITE}
                    />
                    <Text style={styles.actionItemText}>Edit Farm</Text>
                  </TouchableOpacity>

                  <View style={styles.actionDivider} />

                  <TouchableOpacity
                    style={styles.actionItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setActionsExpanded(false);
                      setAddBatchVisible(true);
                    }}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={16}
                      color={Colors.WHITE}
                    />
                    <Text style={styles.actionItemText}>Add New Batch</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.heroBody}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroFarmName} numberOfLines={2}>
              {farm.name}
            </Text>
            <View style={styles.heroMeta}>
              <Ionicons name="location" size={12} color={Colors.G400} />
              <Text style={styles.heroCity}>{farm.city}</Text>
              <View style={styles.heroDot} />
              <Ionicons name="time-outline" size={12} color={Colors.G400} />
              <Text style={styles.heroCity}>
                {getTimeSince(farm.lastVisit)}
              </Text>
            </View>
          </View>

          <View
            style={{
              width: 100,
              alignItems: "flex-end",
              justifyContent: "flex-end",
              paddingTop: 5,
            }}
          >
            <HealthBadge status={farm.status} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
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
        <View style={styles.vitalsStrip}>
          <VitalItem
            label="Live Chicks"
            value={farm.liveChicks.toLocaleString()}
            color={Colors.AMBER600}
            bg={Colors.AMBER50}
            border={Colors.AMBER500}
          />
          <VitalItem
            label="Active Batches"
            value={`${farm.activeBatchCount}`}
            color={Colors.G700}
            bg={Colors.G50}
            border={Colors.G600}
          />
          <VitalItem
            label="Total Batches"
            value={`${farm.totalBatchCount}`}
            color={Colors.G700}
            bg={Colors.G50}
            border={Colors.G600}
          />
          <VitalItem
            label="Mortality"
            value={`${farm.totalMortality}`}
            color={Colors.RED600}
            bg={Colors.RED50}
            border={Colors.RED500}
          />
        </View>

        <SectionHeader title="Batches" badge={`${batches.length} batches`} />
        <View style={{ height: 10 }} />
        <View style={styles.batchesSection}>
          {batches.length > 0 ? (
            batches.map((batch, index) => (
              <BatchCard
                key={batch.id}
                batch={batch}
                onDelete={onDeleteBatch}
                user={user}
                isFirst={index == 0}
              />
            ))
          ) : (
            <EmptyContainer
              title="No Batches Available"
              body="Batches added to this farm will appear here"
            />
          )}
        </View>

        {user?.role == "owner" && (
          <View>
            <View style={{ height: 20 }} />
            <SectionHeader
              title="Assigned Officers"
              badge={`${farm.officers.length} officers`}
            />

            <View>
              {farm.officers.length === 0 ? (
                <EmptyContainer
                  title="No Officers Assigned"
                  body="Offiers assigned to this farm will appear here"
                />
              ) : (
                farm.officers.map((officer, index) => (
                  <TouchableOpacity
                    key={officer.id}
                    style={[
                      styles.officerRow,
                      index === 0 && styles.officerRowFirst,
                    ]}
                    activeOpacity={0.6}
                    onPress={() => {
                      navigateFromStack("Officers");
                    }}
                  >
                    <View style={styles.officerAvatar}>
                      <Text style={styles.officerInitials}>
                        {getInitials(officer.name)}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.officerName}>{officer.name}</Text>
                      <Text style={styles.officerPhone}>{officer.phone}</Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={15}
                      color={Colors.SLATE500}
                    />
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />

        <SectionHeader title="Farm Details" />

        <View style={styles.chipGrid}>
          <InfoChip icon="call-outline" label="Contact" value={farm.tel} />
        </View>

        <View style={[styles.chipGrid, { marginTop: 10 }]}>
          <InfoChip icon="location-outline" label="City" value={farm.city} />
          <InfoChip
            icon="calendar-outline"
            label="Last Visit"
            value={getTimeSince(farm.lastVisit)}
          />
        </View>
        <View style={[styles.chipGrid, { marginTop: 10 }]}>
          <InfoChip
            icon="navigate-outline"
            label="Address"
            value={farm.address}
          />
        </View>
      </ScrollView>
      <LoadingOverlay visible={loading} />
      <AddBatchOverlay
        farm={farm}
        onClose={() => {
          setAddBatchVisible(false);
          loadData();
        }}
        visible={addBatchVisible}
      />
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
    position: "relative",
    zIndex: 10,

    ...Platform.select({
      ios: {
        shadowColor: Colors.G950,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  heroDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
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
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionBtnText: {
    fontSize: 13,
    color: Colors.WHITE,
    fontWeight: "700",
  },
  actionBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },

  actionDropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    width: 170,
    backgroundColor: Colors.G900,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 6,
    overflow: "hidden",
    zIndex: 100,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  actionDivider: {
    height: 0.5,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },

  actionItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.WHITE,
  },
  actionWrapper: {
    position: "relative",
    alignItems: "flex-end",
    zIndex: 100,
  },

  // Hero body
  heroBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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

  timelineWrap: {
    paddingLeft: 4,
  },
  officerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.SLATE100,
  },
  officerRowFirst: {
    borderTopWidth: 0,
  },

  officerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.G700,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.G100,
  },
  officerInitials: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.WHITE,
  },

  officerName: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.SLATE700,
  },
  officerPhone: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.SLATE500,
    marginTop: 1,
  },

  noOfficers: {
    fontSize: 13,
    color: Colors.SLATE500,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },

  officersHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  officersIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.G50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.G100,
  },

  officersLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.SLATE500,
    letterSpacing: 0.5,
  },

  officersCount: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.SLATE700,
    marginTop: 1,
  },

  batchesSection: {
    flex: 1,
    flexDirection: "column",
  },
});
