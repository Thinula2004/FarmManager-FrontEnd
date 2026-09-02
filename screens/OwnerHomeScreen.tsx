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
  TextInput,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { navigateFromStack, RootStackParamList } from "../navigation/navigator";
import User from "../models/User";
import { getUser } from "../services/AuthService";
import Farm from "../models/Farm";
import FarmCard from "../components/Dashboard/FarmCard";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../services/ColorPalette";
import FarmDetailed from "../models/FarmDetailed";
import DashboardSummery from "../models/DashboardSummery";
import { getDashboardSummery } from "../controllers/statController";
import { getAllFarmsDetailed } from "../controllers/farmController";
import LoadingOverlay from "../components/Common/LoadingOverlay";

export default function OwnerHomeScreen() {
  const [summery, setSummery] = useState<DashboardSummery | null>(null);
  const [farms, setFarms] = useState<FarmDetailed[]>([]);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedOnce = useRef(false);
  const [search, setSearch] = useState("");

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const storedUser = await getUser();
        setUser(storedUser);
      };
      loadUser();
      const firstLoad = !hasLoadedOnce.current;

      hasLoadedOnce.current = true;

      loadData(firstLoad);

      setSearch("");
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

      await Promise.all([loadSummery(), loadFarms()]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadFarms = async () => {
    const data = await getAllFarmsDetailed();

    setFarms(data);
  };

  const loadSummery = async () => {
    const data = await getDashboardSummery();

    if (data) {
      setSummery(data);
    }
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

  const filtered = farms.filter((farm) => {
    const query = search.toLowerCase();

    return (
      farm.name.toLowerCase().includes(query) ||
      farm.city.toLowerCase().includes(query)
    );
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.G50} />

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
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.dateLabel}>{today}</Text>
            <Text style={styles.headerTitle}>{user?.name ?? "Loading..."}</Text>
            <Text style={styles.headerSubtitle}>Farm Owner</Text>
          </View>

          <TouchableOpacity
            style={styles.avatarBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.avatarText}>{initials}</Text>
            <View style={styles.avatarDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroBanner}>
          <View style={styles.heroRingOuter} />
          <View style={styles.heroRingInner} />

          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>LIVE CHICKS</Text>
              <Text style={styles.heroNumber}>{summery?.liveChicks}</Text>
              <View style={styles.heroBadge}>
                <View style={styles.heroBadgeDot} />
                <Text style={styles.heroBadgeText}>All systems active</Text>
              </View>
            </View>

            <View style={styles.heroRight}>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatValue}>{summery?.farmCount}</Text>
                <Text style={styles.miniStatLabel}>Farms</Text>
              </View>
              <View style={styles.miniStatDivider} />
              <View style={styles.miniStat}>
                <Text style={[styles.miniStatValue, styles.redValue]}>
                  {summery?.totalMortality}
                </Text>
                <Text style={styles.miniStatLabel}>Mortality</Text>
              </View>
              <View style={styles.miniStatDivider} />
              <View style={styles.miniStat}>
                <Text style={styles.miniStatValue}>
                  {summery?.officerCount}
                </Text>
                <Text style={styles.miniStatLabel}>Officers</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleGroup}>
            <Text style={styles.sectionTitle}>Your Farms</Text>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{filtered.length} farms</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.8}
            onPress={() => navigateFromStack("Farms")}
          >
            <Ionicons name="add" size={22} color={Colors.WHITE} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={17} color={Colors.SLATE500} />

          <TextInput
            style={styles.searchInput}
            placeholder="Search by farm name or city"
            placeholderTextColor={Colors.SLATE500}
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color={Colors.SLATE500} />
            </TouchableOpacity>
          )}
        </View>

        {filtered.map((farm) => (
          <FarmCard key={farm.id} farm={farm} />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.G50,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

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

  heroBanner: {
    backgroundColor: Colors.G700,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    overflow: "hidden",
    minHeight: 160,
    ...Platform.select({
      ios: {
        shadowColor: Colors.G900,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
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
    color: Colors.WHITE,
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
    backgroundColor: Colors.G500,
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
    color: Colors.WHITE,
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
    color: "#ff9191",
  },

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
  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.G700,
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: Colors.G700,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 15,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.SLATE900,
    fontWeight: "500",
  },
});
