import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  Platform,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Colors from "../services/ColorPalette";
import Activity from "../models/Activity";
import LoadingOverlay from "../components/Common/LoadingOverlay";
import { getActivities } from "../controllers/activityController";
import ActivityRow from "../components/ActivityLogScreen/ActivityRow";

type ActivitySection = {
  label: string;
  data: Activity[];
};

function groupByDate(activities: Activity[]): ActivitySection[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const order: string[] = [];
  const groups: Map<string, Activity[]> = new Map();

  for (const activity of activities) {
    const d = new Date(activity.createdAt);
    d.setHours(0, 0, 0, 0);

    let label: string;
    if (d.getTime() === today.getTime()) {
      label = "Today";
    } else if (d.getTime() === yesterday.getTime()) {
      label = "Yesterday";
    } else {
      label = new Date(activity.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    if (!groups.has(label)) {
      groups.set(label, []);
      order.push(label);
    }
    groups.get(label)!.push(activity);
  }

  return order.map((label) => ({ label, data: groups.get(label)! }));
}

export default function ActivityLogScreen() {
  const navigation = useNavigation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedOnce = useRef(false);
  const sections = useMemo(() => groupByDate(activities), [activities]);

  useFocusEffect(
    useCallback(() => {
      const firstLoad = !hasLoadedOnce.current;
      hasLoadedOnce.current = true;
      loadData(firstLoad);
    }, []),
  );

  const loadData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getActivities();
      setActivities(data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: {
      item: Activity;
      index: number;
      section: ActivitySection;
    }) => (
      <ActivityRow
        activity={item}
        isFirst={index === 0}
        isLast={index === section.data.length - 1}
      />
    ),
    [],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: ActivitySection }) => (
      <View style={s.sectionHeaderWrap}>
        <View style={s.dateLabelRow}>
          <Text style={s.dateLabelText}>{section.label}</Text>
          <View style={s.dateLabelLine} />
        </View>
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView style={s.safe} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.G950} />

      <View style={s.topBar}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.WHITE} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={s.topBarTitle}>Activity Log</Text>

          <Text style={s.topBarSub}>
            Actions performed by owners and officers
          </Text>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        style={s.list}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews={Platform.OS === "android"}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.G700}
            colors={[Colors.G700]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={s.emptyWrap}>
              <View style={s.emptyIconWrap}>
                <Ionicons
                  name="time-outline"
                  size={26}
                  color={Colors.SLATE500}
                />
              </View>
              <Text style={s.emptyTitle}>No activity yet</Text>
              <Text style={s.emptyBody}>
                Actions on farms, batches, and officers will appear here.
              </Text>
            </View>
          ) : null
        }
      />

      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.G50 },

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
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },

      android: {
        elevation: 6,
      },
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

  topBarSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    marginTop: 1,
  },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 32 },

  sectionHeaderWrap: { backgroundColor: Colors.G50 },
  dateLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 10,
    paddingBottom: 8,
  },
  dateLabelText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  dateLabelLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.SLATE200,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 64,
    gap: 10,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.SLATE100,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.SLATE700,
    letterSpacing: -0.2,
  },
  emptyBody: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.SLATE500,
    textAlign: "center",
    lineHeight: 20,
  },
});
