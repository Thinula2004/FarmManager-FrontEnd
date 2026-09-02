import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Colors from "../services/ColorPalette";
import { RootStackParamList } from "../navigation/navigator";
import EmptyContainer from "../components/Common/EmptyContainer";
import LoadingOverlay from "../components/Common/LoadingOverlay";
import { useCallback, useRef, useState } from "react";
import Chart, { ChartPoint } from "../components/Common/Chart";
import { getDaysSince, stringToDate } from "../services/Util";
import {
  getAvgWeightData,
  getFeedData,
  getMortalityData,
} from "../controllers/chartDataController";

type Props = NativeStackScreenProps<RootStackParamList, "BatchMetrics">;

export default function BatchMetricsScreen({ route }: Props) {
  const { batch } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);
  const [weightData, setWeightData] = useState<ChartPoint[]>([]);
  const [mortalityData, setMortalityData] = useState<ChartPoint[]>([]);
  const [feedData, setFeedData] = useState<ChartPoint[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const firstLoad = !hasLoadedOnce.current;

      hasLoadedOnce.current = true;
      loadData(firstLoad);
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

  const loadData = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      await Promise.all([
        loadWeightData(),
        loadMortalityData(),
        loadFeedData(),
      ]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadWeightData = async () => {
    const data = await getAvgWeightData(batch.id);
    setWeightData(data);
  };

  const loadMortalityData = async () => {
    const data = await getMortalityData(batch.id);
    setMortalityData(data);
  };

  const loadFeedData = async () => {
    const data = await getFeedData(batch.id);
    setFeedData(data);
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

          <View style={s.heroBody}>
            <Text style={s.heroTitle}>Batch Metrics</Text>
            <Text style={s.heroSub}>
              {batch?.name}
              {batch?.farm?.name ? `  ·  ${batch.farm.name}` : ""}
            </Text>
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
        <View style={{ height: 8 }} />
        <View style={s.sectionHeader}>
          <View style={s.sectionIconWrap}>
            <Ionicons name={"scale"} size={16} color={Colors.G50} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Average Weight Chart</Text>
            <Text style={s.sectionSubtitle}>
              Weight progression across visits
            </Text>
          </View>
        </View>
        <View style={s.chartCard}>
          {weightData.length > 0 ? (
            <Chart
              key={1}
              data={weightData}
              unit="kg"
              accentColor={Colors.G700}
              referenceData={[
                {
                  date: 0,
                  value: 0,
                },
                {
                  date: 7,
                  value: 0.204,
                },
                {
                  date: 14,
                  value: 0.512,
                },
                {
                  date: 21,
                  value: 0.978,
                },
                {
                  date: 28,
                  value: 1.567,
                },
                {
                  date: 35,
                  value: 2.226,
                },
                {
                  date: 42,
                  value: 2.901,
                },
                {
                  date: 49,
                  value: 3.552,
                },
                {
                  date: 56,
                  value: 4.15,
                },
                {
                  date: 63,
                  value: 4.68,
                },
                {
                  date: 70,
                  value: 5.139,
                },
              ]}
              referenceLabel="Target"
              decimals={2}
              gap={1}
            />
          ) : (
            <View style={s.chartEmpty}>
              <View style={s.chartEmptyIconWrap}>
                <Ionicons
                  name={"scale-outline"}
                  size={22}
                  color={Colors.G300}
                />
              </View>
              <Text style={s.chartEmptyLabel}>No weight data yet</Text>
              <Text style={s.chartEmptyBody}>
                Record a field visit with a weight sample to start plotting this
                chart.
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 22 }} />
        <View style={s.sectionHeader}>
          <View style={[s.sectionIconWrap, { backgroundColor: Colors.RED500 }]}>
            <Ionicons
              name={"trending-down-outline"}
              size={16}
              color={Colors.RED50}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Mortality Chart</Text>
            <Text style={s.sectionSubtitle}>Deaths recorded over time</Text>
          </View>
        </View>
        <View style={s.chartCard}>
          {mortalityData.length > 0 ? (
            <Chart
              key={1}
              data={mortalityData}
              unit=" deaths"
              accentColor={Colors.RED500}
              referenceColor={Colors.SLATE450}
              referenceData={[
                {
                  date: 1,
                  value: (batch.initialCount / 100) * 3,
                },
              ]}
              referenceLabel="Critical Limit"
              decimals={0}
              gap={1}
            />
          ) : (
            <View style={s.chartEmpty}>
              <View
                style={[
                  s.chartEmptyIconWrap,
                  { backgroundColor: Colors.RED50, borderColor: Colors.RED100 },
                ]}
              >
                <Ionicons
                  name={"trending-down-outline"}
                  size={22}
                  color={Colors.RED500}
                />
              </View>
              <Text style={s.chartEmptyLabel}>No mortality data yet</Text>
              <Text style={s.chartEmptyBody}>
                Mortality entries from field visits will be charted here.
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 22 }} />
        <View style={s.sectionHeader}>
          <View
            style={[s.sectionIconWrap, { backgroundColor: Colors.AMBER600 }]}
          >
            <Ionicons name={"nutrition"} size={16} color={Colors.AMBER50} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Feed Chart</Text>
            <Text style={s.sectionSubtitle}>Feed consumed over time</Text>
          </View>
        </View>
        <View style={s.chartCard}>
          {feedData.length > 0 ? (
            <Chart
              key={1}
              data={feedData}
              unit="kg"
              accentColor={Colors.AMBER600}
              decimals={2}
              gap={1}
            />
          ) : (
            <View style={s.chartEmpty}>
              <View
                style={[
                  s.chartEmptyIconWrap,
                  {
                    backgroundColor: Colors.AMBER50,
                    borderColor: Colors.AMBER200,
                  },
                ]}
              >
                <Ionicons
                  name={"nutrition-outline"}
                  size={22}
                  color={Colors.AMBER500}
                />
              </View>
              <Text style={s.chartEmptyLabel}>No feed data yet</Text>
              <Text style={s.chartEmptyBody}>
                Feed data from field visits will be charted here.
              </Text>
            </View>
          )}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
      <LoadingOverlay visible={loading} />
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

  // ── Hero ───────────────────────────────────────────────
  hero: {
    backgroundColor: Colors.G900,
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 0,
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
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  backBtn: {
    marginRight: 20,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBody: {
    flex: 2,
    paddingTop: 10,
    gap: 3,
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.WHITE,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.G400,
    marginTop: 2,
  },

  // ── Sections ───────────────────────────────────────────
  section: {},
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.G700,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.SLATE500,
    marginTop: 1,
  },

  // ── Chart card ─────────────────────────────────────────
  chartCard: {
    marginVertical: 10,
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.SLATE300,
    overflow: "hidden",
    minHeight: 200,
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
  chartEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    paddingHorizontal: 28,
  },
  chartEmptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  chartEmptyLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: Colors.SLATE700,
    marginBottom: 4,
  },
  chartEmptyBody: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.SLATE500,
    textAlign: "center",
    lineHeight: 17,
    maxWidth: 240,
  },

  ageBadgeOuter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 2,
    borderColor: Colors.G500,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    paddingBottom: 2,
    marginTop: 8,
  },
  ageBadgeInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  ageBadgeDay: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.WHITE,
    letterSpacing: -1,
    lineHeight: 20,
  },
  ageBadgeLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: Colors.G400,
    letterSpacing: 2,
  },
});
