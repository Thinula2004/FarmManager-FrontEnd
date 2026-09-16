import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  RefreshControl,
  Alert,
  Pressable,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../services/ColorPalette";
import SectionHeader from "../components/BatchScreen/SectionHeader";
import { SupplyCategory } from "../enums/SupplyType";
import { useCallback, useEffect, useRef, useState } from "react";
import Batch from "../models/Batch";
import {
  capitalize,
  formatDate,
  formatWeight,
  getDaysSince,
  getSupplyIcon,
  getTimeSince,
  showToast,
  stringToDate,
} from "../services/Util";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { navigateFromStack, RootStackParamList } from "../navigation/navigator";
import { getBatchByID } from "../controllers/batchController";
import FeedEntry from "../models/FeedEntry";
import Visit from "../models/Visit";
import { getVisitsFromBatch } from "../controllers/visitController";
import SupplyEntry from "../models/SupplyEntry";
import {
  deleteSupplyEntry,
  getSupplyEntriesFromBatch,
} from "../controllers/supplyController";
import EmptyContainer from "../components/Common/EmptyContainer";
import { VisitCard } from "../components/BatchScreen/VisitCard";
import LoadingOverlay from "../components/Common/LoadingOverlay";
import AddFeedOverlay from "../components/BatchScreen/AddFeedOverlay";
import {
  deleteFeedEntry,
  getFeedEntriesFromBatch,
} from "../controllers/feedController";
import AddSupplyOverlay from "../components/BatchScreen/AddSupplyOverlay";
import User from "../models/User";
import { getUser } from "../services/AuthService";
import AddVisitOverlay from "../components/BatchScreen/AddVisitOverlay";
import ViewVisitOverlay from "../components/Common/ViewVisitOverlay";
import Chillout from "../models/Chillout";
import { getChilloutsFromBatch } from "../controllers/chilloutController";
import ChilloutCard from "../components/BatchScreen/ChilloutCard";
import AddChilloutOverlay from "../components/BatchScreen/AddChilloutOverlay";

const STATUS_CONFIG = {
  Ongoing: {
    bg: Colors.G100,
    text: Colors.G700,
    dot: Colors.G500,
    label: "Ongoing",
  },
  Completed: {
    bg: Colors.AMBER100,
    text: Colors.AMBER600,
    dot: Colors.AMBER500,
    label: "Completed",
  },
};

function supplyCategoryColor(category: SupplyCategory) {
  switch (category) {
    case SupplyCategory.Vitamin:
      return { bg: Colors.G50, icon: Colors.G700, border: Colors.G100 };
    case SupplyCategory.Medicine:
      return { bg: Colors.RED50, icon: Colors.RED600, border: Colors.RED100 };
    case SupplyCategory.Supplement:
      return {
        bg: Colors.AMBER50,
        icon: Colors.AMBER600,
        border: Colors.AMBER100,
      };
    default:
      return {
        bg: Colors.SLATE100,
        icon: Colors.SLATE500,
        border: Colors.SLATE200,
      };
  }
}

type Props = NativeStackScreenProps<RootStackParamList, "Batch">;
export default function BatchScreen({ route }: Props) {
  const { batchId } = route.params;
  const [batch, setBatch] = useState<Batch | null>(null);
  const navigation = useNavigation();
  const status = STATUS_CONFIG[batch?.getStatus ?? "Completed"];
  const [feedEntries, setFeedEntries] = useState<FeedEntry[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [suppliEntries, setSupplyEntries] = useState<SupplyEntry[]>([]);
  const [chillouts, setChillouts] = useState<Chillout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionsExpanded, setActionsExpanded] = useState(false);
  const hasLoadedOnce = useRef(false);
  const [feedOverlayVisible, setFeedOverlayVisible] = useState<boolean>(false);
  const [supplyOverlayVisible, setSupplyOverlayVisible] =
    useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [addVisitOverlayVisible, setAddVisitOverlayVisible] = useState(false);
  const [addChilloutOverlayVisible, setAddChilloutOverlayVisible] =
    useState(false);
  const [viewingVisit, setViewingVisit] = useState<Visit | null>(null);

  useFocusEffect(
    useCallback(() => {
      const firstLoad = !hasLoadedOnce.current;

      hasLoadedOnce.current = true;
      loadData(firstLoad);
    }, []),
  );

  useEffect(() => {
    getUser().then(setUser);
  }, []);

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

  const loadData = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      await Promise.all([
        loadBatch(),
        loadFeedEntries(),
        loadSupplies(),
        loadVisits(),
        loadChillouts(),
      ]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadBatch = async () => {
    const data = await getBatchByID(batchId);
    if (data) {
      setBatch(data);
    }
  };

  const loadFeedEntries = async () => {
    const data = await getFeedEntriesFromBatch(batchId);
    setFeedEntries(data);
  };

  const loadVisits = async () => {
    const data = await getVisitsFromBatch(batchId);
    setVisits(data);
  };

  const loadSupplies = async () => {
    const data = await getSupplyEntriesFromBatch(batchId);
    setSupplyEntries(data);
  };

  const loadChillouts = async () => {
    const data = await getChilloutsFromBatch(batchId);
    setChillouts(data);
  };

  const getChilloutCount = () => {
    return chillouts.reduce(
      (total, chillout) => total + (chillout.count ?? 0),
      0,
    );
  };

  const handleDeleteSupply = async (entryId: string) => {
    Alert.alert(
      "Delete Supply",
      "Are you sure you want to delete this supply entry? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteSupplyEntry(entryId);
              if (success) {
                showToast("success", "Supply entry deleted successfully");
                loadSupplies();
              }
            } catch (error) {
              console.error("Failed to delete supply:", error);
            }
          },
        },
      ],
    );
  };

  const handleDeleteFeed = async (entryId: string) => {
    Alert.alert(
      "Delete Feed Entry",
      "Are you sure you want to delete this feed entry? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteFeedEntry(entryId);
              if (success) {
                showToast("success", "Feed entry deleted successfully");
                loadData();
              }
            } catch (error) {
              console.error("Failed to delete supply:", error);
            }
          },
        },
      ],
    );
  };

  const canDeleteFeedEntry = (feedEntry: FeedEntry) => {
    if (visits.length === 0) {
      return true;
    }

    const feedDate = new Date(feedEntry.createdAt);

    const hasLaterVisit = visits.some((visit) => {
      const visitDate = new Date(visit.visitedDate);

      return visitDate >= feedDate;
    });

    return !hasLaterVisit;
  };

  return (
    <SafeAreaView style={s.safe} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.G950} />

      <View style={s.hero}>
        <View style={s.heroBackground}>
          <View style={s.ringA} />
          <View style={s.ringB} />
        </View>
        <View style={s.heroNav}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.WHITE} />
          </TouchableOpacity>
          {batch?.status != "COMPLETED" && user && user.role == "owner" && (
            <View style={s.actionWrapper}>
              <TouchableOpacity
                style={s.actionBtn}
                activeOpacity={0.8}
                onPress={() => setActionsExpanded((prev) => !prev)}
              >
                <Text style={s.actionBtnText}>Action</Text>

                <Ionicons
                  name={
                    actionsExpanded ? "caret-up-outline" : "caret-down-outline"
                  }
                  size={13}
                  color={Colors.WHITE}
                />
              </TouchableOpacity>

              {actionsExpanded && (
                <View style={s.actionDropdown}>
                  <TouchableOpacity
                    style={s.actionItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setActionsExpanded(false);
                      setFeedOverlayVisible(true);
                    }}
                  >
                    <Ionicons
                      name="nutrition-outline"
                      size={16}
                      color={Colors.WHITE}
                    />
                    <Text style={s.actionItemText}>Add Feed</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={s.actionItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setActionsExpanded(false);
                      setSupplyOverlayVisible(true);
                    }}
                  >
                    <Ionicons
                      name="medkit-outline"
                      size={16}
                      color={Colors.WHITE}
                    />
                    <Text style={s.actionItemText}>Add Supplies</Text>
                  </TouchableOpacity>

                  <View style={s.actionDivider} />

                  <TouchableOpacity
                    style={s.actionItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setActionsExpanded(false);
                      setAddVisitOverlayVisible(true);
                    }}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color={Colors.WHITE}
                    />
                    <Text style={s.actionItemText}>Record a Visit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={s.actionItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setActionsExpanded(false);
                      setAddChilloutOverlayVisible(true);
                    }}
                  >
                    <Ionicons
                      name="cart-outline"
                      size={16}
                      color={Colors.WHITE}
                    />
                    <Text style={s.actionItemText}>Chillout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          {batch?.status != "COMPLETED" && user && user.role == "officer" && (
            <View>
              <TouchableOpacity
                style={s.actionBtn}
                activeOpacity={0.8}
                onPress={() => setAddVisitOverlayVisible(true)}
              >
                <Text style={s.actionBtnText}>Record a Visit</Text>
                <Ionicons
                  name={"add-circle-outline"}
                  size={15}
                  color={Colors.WHITE}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={s.heroBody}>
          <View style={s.heroLeft}>
            <View style={[s.statusPill, { backgroundColor: status.bg }]}>
              <View style={[s.statusDot, { backgroundColor: status.dot }]} />
              <Text style={[s.statusText, { color: status.text }]}>
                {status.label}
              </Text>
            </View>

            <Text style={s.heroTitle} numberOfLines={2}>
              {batch?.name}
            </Text>
            <Text style={s.heroFarmName}>{batch?.farm.name}</Text>

            <View style={s.heroMeta}>
              <Ionicons name="leaf-outline" size={12} color={Colors.G400} />
              <Text style={s.heroMetaText}>{batch?.breed.name}</Text>
              <View style={s.heroDot} />
              <Ionicons name="calendar-outline" size={12} color={Colors.G400} />
              <Text style={s.heroMetaText}>
                {formatDate(stringToDate(batch?.inDate), "-")}
              </Text>
            </View>
          </View>

          <View style={s.ageBadgeOuter}>
            <View style={s.ageBadgeInner}>
              <Text style={s.ageBadgeDay}>{getDaysSince(batch?.inDate)}</Text>
              <Text style={s.ageBadgeLabel}>DAY</Text>
            </View>
          </View>
        </View>
      </View>

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
        <View style={{ height: 10 }} />
        <SectionHeader icon="egg-outline" title="Chick Details" />
        <View style={{ height: 5 }} />

        <View style={s.card}>
          <View style={s.breedRow}>
            <View style={s.breedIconWrap}>
              <Ionicons name="leaf" size={18} color={Colors.G700} />
            </View>
            <View>
              <Text style={s.breedName}>{batch?.breed.name}</Text>
              <Text style={s.breedSub}>
                {batch && batch.subBreed ? batch.subBreed : "-"}
              </Text>
            </View>
          </View>

          <View style={s.cardDivider} />

          <View style={s.equationWrap}>
            <Text style={s.equationEyebrow}>FLOCK EQUATION</Text>

            {chillouts.length > 0 ? (
              <>
                <View style={[s.equationRow, { marginTop: 10 }]}>
                  <View style={s.eqBlock}>
                    <Text style={s.eqValue}>
                      {batch?.initialCount.toLocaleString()}
                    </Text>
                    <Text style={s.eqLabel}>Initial</Text>
                  </View>

                  <Text style={s.eqOperator}>−</Text>

                  <View style={s.eqBlock}>
                    <Text style={[s.eqValue, s.eqRed]}>
                      {batch?.totalMortality.toLocaleString()}
                    </Text>
                    <Text style={s.eqLabel}>Deaths</Text>
                    <Text style={s.eqPct}>({batch?.mortalityPct}%)</Text>
                  </View>

                  <Text style={s.eqOperator}>−</Text>

                  <View style={s.eqBlock}>
                    <Text style={[s.eqValue, s.eqAmber]}>
                      {getChilloutCount().toLocaleString()}
                    </Text>
                    <Text style={s.eqLabel}>Sold</Text>
                  </View>

                  <Text style={s.eqOperator}>=</Text>

                  <View style={s.eqBlock}>
                    <Text style={[s.eqValue, s.eqGreen]}>
                      {batch?.liveChicks}
                    </Text>
                    <Text style={s.eqLabel}>Live</Text>
                    <Text style={s.eqPct}>({batch?.livePct}%)</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={s.equationRow}>
                <View style={s.eqBlock}>
                  <Text style={s.eqValue}>
                    {batch?.initialCount.toLocaleString()}
                  </Text>
                  <Text style={s.eqLabel}>Initial</Text>
                </View>

                <Text style={s.eqOperator}>−</Text>

                <View style={s.eqBlock}>
                  <Text style={[s.eqValue, s.eqRed]}>
                    {batch?.totalMortality.toLocaleString()}
                  </Text>
                  <Text style={s.eqLabel}>
                    Deaths <Text style={s.eqPct}>({batch?.mortalityPct}%)</Text>
                  </Text>
                </View>

                <Text style={s.eqOperator}>=</Text>

                <View style={s.eqBlock}>
                  <Text style={[s.eqValue, s.eqGreen]}>
                    {batch?.liveChicks.toLocaleString()}
                  </Text>
                  <Text style={s.eqLabel}>
                    Live <Text style={s.eqPct}>({batch?.livePct}%)</Text>
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={s.cardDivider} />

          <View style={s.metricsRow}>
            <View style={s.metricItem}>
              <View
                style={[s.metricIconWrap, { backgroundColor: Colors.AMBER50 }]}
              >
                <Ionicons
                  name="scale-outline"
                  size={16}
                  color={Colors.AMBER600}
                />
              </View>
              {batch?.status != "COMPLETED" ? (
                <View style={{ alignItems: "center" }}>
                  <Text style={s.metricValue}>
                    {formatWeight(batch?.avgWeight)}
                  </Text>
                  <Text style={s.metricLabel}>Avg Weight</Text>
                </View>
              ) : (
                <View style={{ alignItems: "center" }}>
                  <Text style={s.metricValue}>{batch?.totalWeight} KG</Text>
                  <Text style={s.metricLabel}>Total Weight</Text>
                </View>
              )}
            </View>

            <View style={s.metricDivider} />

            <View style={s.metricItem}>
              <View style={[s.metricIconWrap, { backgroundColor: "#eff6ff" }]}>
                <Ionicons name="analytics-outline" size={16} color="#3b82f6" />
              </View>
              <Text style={s.metricValue}>
                {batch?.status.toLowerCase() == "ongoing" ? "~" : ""}{" "}
                {batch?.fcr.toFixed(3)}
              </Text>
              <Text style={s.metricLabel}>FCR</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />

        <TouchableOpacity
          style={s.metricsBtn}
          activeOpacity={0.85}
          onPress={() => {
            navigateFromStack("BatchMetrics", { batch: batch });
          }}
        >
          <View style={s.metricsBtnRing} />
          <View style={s.metricsBtnIconWrap}>
            <Ionicons name="bar-chart-outline" size={20} color={Colors.WHITE} />
          </View>
          <View style={s.metricsBtnTextWrap}>
            <Text style={s.metricsBtnTitle}>Batch Metrics</Text>
            <Text style={s.metricsBtnSub}>
              Charts, trends &amp; performance
            </Text>
          </View>
          <View style={s.metricsBtnChevronWrap}>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="rgba(255,255,255,0.8)"
            />
          </View>
        </TouchableOpacity>

        {chillouts.length > 0 && (
          <>
            <View style={{ height: 24 }} />
            <SectionHeader icon="cart-outline" title="Chillouts" />
            <View style={{ height: 5 }} />
            <View style={{ height: 5 }} />
            {chillouts.map((chillout) => (
              <ChilloutCard
                key={chillout.id}
                chillout={chillout}
                canDelete={
                  user?.role == "owner" &&
                  (chillout.isFinal || batch?.status != "COMPLETED")
                }
                onDelete={() => {
                  loadData();
                }}
              />
            ))}
          </>
        )}

        <View style={{ height: 24 }} />
        <SectionHeader icon="nutrition-outline" title="Feed" />
        <View style={{ height: 5 }} />

        {feedEntries.length > 0 ? (
          <View>
            <View style={s.currentFeedCard}>
              <View style={s.currentFeedLeft}>
                <Text style={s.currentFeedEyebrow}>CURRENT FEED</Text>
                <Text style={s.currentFeedName}>{feedEntries[0].feedType}</Text>
                <View style={s.feedRemainingRow}>
                  <Text style={s.feedRemainingText}>
                    {batch?.feedRemaining ?? 0} kg remaining
                  </Text>
                </View>
              </View>
              <View style={s.feedBag}>
                <Ionicons name="nutrition" size={28} color={Colors.G200} />
              </View>
            </View>

            <View
              style={[
                s.card,
                { borderTopRightRadius: 0, borderTopLeftRadius: 0 },
              ]}
            >
              <Text style={s.logSectionLabel}>Feed History</Text>
              {feedEntries.map((entry, idx) => {
                const canDelete = canDeleteFeedEntry(entry);

                return (
                  <View
                    key={entry.id}
                    style={[
                      s.logRow,
                      idx === 0 && s.logRowFirst,
                      { paddingRight: 10 },
                    ]}
                  >
                    <View style={s.logDateCol}>
                      <Text style={s.logDate}>
                        {formatDate(entry.createdAt)}
                      </Text>
                    </View>

                    <View style={s.logMiddleCol}>
                      <View style={s.logTypeChip}>
                        <Text style={s.logTypeText} numberOfLines={1}>
                          {entry.feedType}
                        </Text>
                      </View>
                    </View>

                    <Text style={s.logAmount}>{entry.weight} kg</Text>
                    {user &&
                      user.role == "owner" &&
                      batch?.status != "COMPLETED" && (
                        <View>
                          {canDelete ? (
                            <TouchableOpacity
                              style={s.supplyDeleteBtn}
                              activeOpacity={0.7}
                              onPress={() => handleDeleteFeed(entry.id)}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={13}
                                color={Colors.RED600}
                              />
                            </TouchableOpacity>
                          ) : (
                            <View style={{ width: 25 }} />
                          )}
                        </View>
                      )}
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <EmptyContainer
            title="No Feed Entries Found"
            body="Feed entries of this batch will appear here"
          />
        )}

        <View style={{ height: 24 }} />
        <SectionHeader icon="medkit-outline" title="Supplies" />
        <View style={{ height: 5 }} />

        {suppliEntries.length > 0 ? (
          <View style={s.card}>
            <Text style={s.logSectionLabel}>Supply Log</Text>
            {suppliEntries.map((entry, idx) => {
              const col = supplyCategoryColor(entry.type);
              return (
                <View
                  key={entry.id}
                  style={[
                    s.supplyRow,
                    idx === 0 && s.logRowFirst,
                    { paddingRight: 10 },
                  ]}
                >
                  <View
                    style={[
                      s.supplyCatIcon,
                      { backgroundColor: col.bg, borderColor: col.border },
                    ]}
                  >
                    <Ionicons
                      name={getSupplyIcon(entry.type)}
                      size={16}
                      color={col.icon}
                    />
                  </View>

                  <View style={s.supplyMiddle}>
                    <Text style={s.supplyName}>{entry.name}</Text>
                    <View style={s.supplyMeta}>
                      <Text style={[s.supplyCatLabel, { color: col.icon }]}>
                        {capitalize(entry.type)}
                      </Text>
                      <Text style={s.supplyDot}>·</Text>
                      <Text style={s.supplyDate}>
                        {formatDate(entry.createdAt)}
                      </Text>
                    </View>
                  </View>

                  <View style={s.supplyAmountWrap}>
                    <Text style={s.supplyAmount}>
                      {entry.quantity}
                      {" " + entry.unit}
                    </Text>
                  </View>
                  {user &&
                    user.role == "owner" &&
                    batch?.status != "COMPLETED" && (
                      <TouchableOpacity
                        style={s.supplyDeleteBtn}
                        activeOpacity={0.7}
                        onPress={() => {
                          handleDeleteSupply(entry.id);
                        }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={13}
                          color={Colors.RED600}
                        />
                      </TouchableOpacity>
                    )}
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyContainer
            title="No Supplies Found"
            body="Supplies of this batch will appear here"
          />
        )}

        <View style={{ height: 24 }} />
        <SectionHeader icon="newspaper-outline" title="Field Visits" />
        <View style={{ height: 5 }} />

        {visits.length > 0 ? (
          <View>
            {visits.map((visit, index) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                isLast={index == 0 && batch?.status != "COMPLETED"}
                refresh={loadData}
                onView={setViewingVisit}
              />
            ))}
          </View>
        ) : (
          <EmptyContainer
            title="No Visits Done"
            body="Field Visit records of this batch will appear here"
          />
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <LoadingOverlay visible={loading} />
      <AddFeedOverlay
        visible={feedOverlayVisible}
        batch={batch}
        onClose={() => {
          setFeedOverlayVisible(false);
          loadFeedEntries();
          loadBatch();
        }}
      />
      <AddSupplyOverlay
        batch={batch}
        onClose={() => {
          setSupplyOverlayVisible(false);
          loadSupplies();
        }}
        visible={supplyOverlayVisible}
      />
      <AddVisitOverlay
        visible={addVisitOverlayVisible}
        batch={batch}
        lastVisit={visits.length > 0 ? visits[0] : null}
        feedEntries={feedEntries}
        onClose={() => setAddVisitOverlayVisible(false)}
        onSaved={() => {
          setAddVisitOverlayVisible(false);
          loadData();
        }}
      />
      <AddChilloutOverlay
        visible={addChilloutOverlayVisible}
        batch={batch}
        onClose={() => {
          setAddChilloutOverlayVisible(false);
          loadData();
        }}
      />
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
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 40,
  },

  hero: {
    zIndex: 100,
    elevation: 100,
    backgroundColor: Colors.G900,
    paddingHorizontal: 18,
    paddingTop: 52,
    paddingBottom: 26,
    overflow: "visible",

    ...Platform.select({
      ios: {
        shadowColor: Colors.G950,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
    }),
  },
  heroBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  heroNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
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

  heroBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  heroLeft: {
    flex: 1,
    gap: 7,
    paddingRight: 12,
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  heroTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: Colors.WHITE,
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  heroFarmName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.G400,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  heroMetaText: {
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

  ageBadgeOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 2,
    borderColor: Colors.G500,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ageBadgeInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  ageBadgeDay: {
    fontSize: 26,
    fontWeight: "900",
    color: Colors.WHITE,
    letterSpacing: -1,
    lineHeight: 28,
  },
  ageBadgeLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.G400,
    letterSpacing: 2,
    marginTop: 1,
  },

  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: Colors.SLATE900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.SLATE100,
    marginHorizontal: 0,
  },

  breedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  breedIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },
  breedName: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.2,
  },
  breedSub: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.SLATE500,
    marginTop: 2,
  },

  equationWrap: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  equationEyebrow: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.SLATE500,
    letterSpacing: 1.8,
    marginBottom: 14,
  },
  equationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eqBlock: {
    alignItems: "center",
    flex: 1,
  },
  eqLiveBlock: {
    backgroundColor: Colors.G50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.G100,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  eqValue: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.SLATE900,
    letterSpacing: -1,
  },
  eqRed: {
    color: Colors.RED600,
  },
  eqGreen: {
    color: Colors.G700,
  },
  eqLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.SLATE500,
    marginTop: 4,
    textAlign: "center",
  },
  eqPct: {
    fontSize: 10,
    color: Colors.SLATE500,
    fontWeight: "500",
  },
  eqOperator: {
    fontSize: 16,
    fontWeight: "300",
    color: Colors.SLATE500,
    marginHorizontal: 2,
    lineHeight: 32,
  },
  eqAmber: {
    color: Colors.AMBER600,
  },

  chilloutBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    backgroundColor: Colors.AMBER50,
    borderWidth: 1,
    borderColor: Colors.AMBER100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chilloutBannerIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: Colors.AMBER100,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chilloutBannerText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.AMBER800,
    flex: 1,
  },
  chilloutBannerBold: {
    fontWeight: "800",
    color: Colors.AMBER600,
  },

  metricsRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricDivider: {
    width: 1,
    backgroundColor: Colors.SLATE100,
    marginVertical: 4,
  },

  currentFeedCard: {
    backgroundColor: Colors.G700,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: Colors.G950,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: { elevation: 5 },
    }),
  },
  currentFeedLeft: {
    flex: 1,
  },
  currentFeedEyebrow: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  currentFeedName: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  feedRemainingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  feedRemainingText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.WHITE,
  },
  feedBag: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  logSectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.SLATE500,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.SLATE100,
    gap: 10,
  },
  logRowFirst: {
    borderTopWidth: 0,
  },
  logDateCol: {
    width: 88,
  },
  logDate: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.SLATE500,
  },
  logMiddleCol: {
    flex: 2,
    justifyContent: "flex-start",
  },
  logTypeChip: {
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  logTypeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.G700,
  },
  logAmount: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.2,
    minWidth: 52,
    textAlign: "right",
  },

  supplyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: Colors.SLATE100,
    gap: 12,
  },
  supplyCatIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  supplyMiddle: {
    flex: 1,
    gap: 3,
  },
  supplyName: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.SLATE900,
    letterSpacing: -0.1,
  },
  supplyMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  supplyCatLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  supplyDot: {
    fontSize: 12,
    color: Colors.SLATE500,
  },
  supplyDate: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.SLATE500,
  },
  supplyAmountWrap: {
    backgroundColor: Colors.SLATE100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  supplyAmount: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.SLATE700,
  },
  supplyDeleteBtn: {
    width: 25,
    height: 25,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.RED50,
    borderWidth: 1,
    borderColor: Colors.RED100,
  },

  metricsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.G700,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: Colors.G950,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  metricsBtnRing: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 20,
    borderColor: "rgba(255,255,255,0.06)",
  },
  metricsBtnIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  metricsBtnTextWrap: {
    flex: 1,
  },
  metricsBtnTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: -0.2,
  },
  metricsBtnSub: {
    fontSize: 11.5,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  metricsBtnChevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
});
