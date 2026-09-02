import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../services/ColorPalette";
import Activity from "../models/Activity";
import { ActivityAction } from "../enums/ActivityAction";
import { ActivityEntity } from "../enums/ActivityEntity";
import User from "../models/User";
import { useCallback, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import LoadingOverlay from "../components/Common/LoadingOverlay";
import { getActivities } from "../controllers/activityController";

type ActivityGroup = {
  label: string;
  entries: Activity[];
};

type ActionStyle = {
  color: string;
  bg: string;
  border: string;
  icon: keyof typeof Ionicons.glyphMap;
  verb: string;
};

const ACTION_STYLE: Record<ActivityAction, ActionStyle> = {
  [ActivityAction.CREATED]: {
    color: "#3B6D11",
    bg: "#EAF3DE",
    border: "#C0DD97",
    icon: "add-circle-outline",
    verb: "Created",
  },
  [ActivityAction.ADDED]: {
    color: "#3B6D11",
    bg: "#EAF3DE",
    border: "#C0DD97",
    icon: "add-outline",
    verb: "Added",
  },
  [ActivityAction.RECORDED]: {
    color: "#0F6E56",
    bg: "#E1F5EE",
    border: "#9FE1CB",
    icon: "clipboard-outline",
    verb: "Recorded",
  },
  [ActivityAction.UPDATED]: {
    color: "#854F0B",
    bg: "#FAEEDA",
    border: "#FAC775",
    icon: "pencil-outline",
    verb: "Updated",
  },
  [ActivityAction.DELETED]: {
    color: "#A32D2D",
    bg: "#FCEBEB",
    border: "#F7C1C1",
    icon: "trash-outline",
    verb: "Deleted",
  },
  [ActivityAction.OPENED]: {
    color: "#185FA5",
    bg: "#E6F1FB",
    border: "#B5D4F4",
    icon: "lock-open-outline",
    verb: "Opened",
  },
  [ActivityAction.CLOSED]: {
    color: "#5F5E5A",
    bg: "#F1EFE8",
    border: "#D3D1C7",
    icon: "lock-closed-outline",
    verb: "Closed",
  },
  [ActivityAction.ACTIVATED]: {
    color: "#185FA5",
    bg: "#E6F1FB",
    border: "#B5D4F4",
    icon: "checkmark-circle-outline",
    verb: "Activated",
  },
  [ActivityAction.DEACTIVATED]: {
    color: "#5F5E5A",
    bg: "#F1EFE8",
    border: "#D3D1C7",
    icon: "remove-circle-outline",
    verb: "Deactivated",
  },
};

type EntityStyle = {
  color: string;
  bg: string;
  border: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const ENTITY_STYLE: Record<ActivityEntity, EntityStyle> = {
  [ActivityEntity.FARM]: {
    color: "#3B6D11",
    bg: "#EAF3DE",
    border: "#C0DD97",
    icon: "storefront-outline",
  },
  [ActivityEntity.BATCH]: {
    color: "#0F6E56",
    bg: "#E1F5EE",
    border: "#9FE1CB",
    icon: "layers-outline",
  },
  [ActivityEntity.VISIT]: {
    color: "#0F6E56",
    bg: "#E1F5EE",
    border: "#9FE1CB",
    icon: "clipboard-outline",
  },
  [ActivityEntity.OFFICER]: {
    color: "#185FA5",
    bg: "#E6F1FB",
    border: "#B5D4F4",
    icon: "person-outline",
  },
  [ActivityEntity.FEED_ENTRY]: {
    color: "#854F0B",
    bg: "#FAEEDA",
    border: "#FAC775",
    icon: "nutrition-outline",
  },
  [ActivityEntity.SUPPLY]: {
    color: "#712B13",
    bg: "#FAECE7",
    border: "#F5C4B3",
    icon: "medkit-outline",
  },
  [ActivityEntity.USER]: {
    color: "#5F5E5A",
    bg: "#F1EFE8",
    border: "#D3D1C7",
    icon: "person-circle-outline",
  },
};

function groupByDate(activities: Activity[]): ActivityGroup[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

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

    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(activity);
  }

  return Array.from(groups.entries()).map(([label, entries]) => ({
    label,
    entries,
  }));
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (
    parts.length > 1
      ? parts[0][0] + parts[parts.length - 1][0]
      : (parts[0]?.slice(0, 2) ?? "?")
  ).toUpperCase();
}

export default function ActivityLogScreen() {
  const navigation = useNavigation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedOnce = useRef(false);

  const groups = groupByDate(activities);

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

      await Promise.all([loadActivities()]);
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
      loadData();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadActivities = async () => {
    const data = await getActivities();
    setActivities(data);
  };

  const testUser = User.fromJson({ name: "Thinula" });

  console.log("TEST USER:", testUser);
  console.log("TEST USER NAME:", testUser.name);

  return (
    <View style={{ flex: 1 }}>
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
            View the activities performed by owners and officers
          </Text>
        </View>
      </View>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.G700}
              colors={[Colors.G700]}
            />
          ) : undefined
        }
      >
        {activities.length > 0 ? (
          <View>
            {groups.map((group) => (
              <View key={group.label} style={s.group}>
                {/* Date label */}
                <View style={s.dateLabelRow}>
                  <Text style={s.dateLabelText}>{group.label}</Text>
                  <View style={s.dateLabelLine} />
                </View>

                {/* Entries */}
                {group.entries.map((activity, idx) => {
                  const action =
                    ACTION_STYLE[activity.action as ActivityAction];
                  const entity =
                    ENTITY_STYLE[activity.entity as ActivityEntity];
                  const isFirst = idx === 0;
                  const isLast = idx === group.entries.length - 1;

                  return (
                    <View key={activity.id} style={s.entry}>
                      <View style={s.timelineCol}>
                        <View
                          style={[
                            s.tlConnector,
                            isFirst && s.tlConnectorInvisible,
                          ]}
                        />
                        <View
                          style={[
                            s.tlNode,
                            {
                              backgroundColor: action.bg,
                              borderColor: action.border,
                            },
                          ]}
                        >
                          <Ionicons
                            name={action.icon}
                            size={13}
                            color={action.color}
                          />
                        </View>
                        <View
                          style={[
                            s.tlConnector,
                            isLast && s.tlConnectorInvisible,
                          ]}
                        />
                      </View>

                      {/* Entry body */}
                      <View style={[s.entryBody, isLast && s.entryBodyLast]}>
                        <View style={s.entryRow}>
                          <View style={s.entryMain}>
                            {/* Actor row */}
                            <View style={s.actorRow}>
                              <View style={s.actorAvatar}>
                                <Text style={s.actorInitials}>
                                  {getInitials(activity.user.name)}
                                </Text>
                              </View>
                              <Text style={s.actorName}>
                                {activity.user.name}
                              </Text>
                            </View>

                            {/* Action line */}
                            <View style={s.actionLine}>
                              <Text
                                style={[s.actionVerb, { color: action.color }]}
                              >
                                {action.verb}{" "}
                              </Text>
                              <Text style={s.actionConnector}>{"a "}</Text>
                              <View
                                style={[
                                  s.entityPill,
                                  {
                                    backgroundColor: entity.bg,
                                    borderColor: entity.border,
                                  },
                                ]}
                              >
                                <Ionicons
                                  name={entity.icon}
                                  size={10}
                                  color={entity.color}
                                />
                                <Text
                                  style={[
                                    s.entityPillText,
                                    { color: entity.color },
                                  ]}
                                >
                                  {activity.entity.charAt(0) +
                                    activity.entity.slice(1).toLowerCase()}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Timestamp */}
                          <Text style={s.timestamp}>
                            {formatTime(activity.createdAt.toISOString())}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ) : (
          <View style={s.emptyWrap}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="time-outline" size={28} color={Colors.SLATE500} />
            </View>
            <Text style={s.emptyTitle}>No activity yet</Text>
            <Text style={s.emptyBody}>
              Actions on farms, batches, and officers will appear here.
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
      <LoadingOverlay visible={loading} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

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

  // ── Empty state ──────────────────────────────────────────
  emptyWrap: {
    flex: 1,
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

  // ── Group ────────────────────────────────────────────────
  group: {
    marginBottom: 4,
  },

  // ── Date label ───────────────────────────────────────────
  dateLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  dateLabelText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  dateLabelLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.SLATE200,
  },

  // ── Entry ────────────────────────────────────────────────
  entry: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 16,
  },

  // ── Timeline column ──────────────────────────────────────
  timelineCol: {
    width: 36,
    alignItems: "center",
    marginRight: 5,
    flexShrink: 0,
  },
  tlConnector: {
    width: 1.5,
    flex: 1,
    minHeight: 8,
    backgroundColor: Colors.SLATE200,
  },
  tlConnectorInvisible: {
    backgroundColor: "transparent",
  },
  tlNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // ── Entry body ───────────────────────────────────────────
  entryBody: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.SLATE300,
  },
  entryBodyLast: {
    paddingBottom: 6,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  entryMain: {
    flex: 1,
    gap: 4,
  },

  // ── Actor row ────────────────────────────────────────────
  actorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actorAvatar: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: Colors.G100,
    borderWidth: 1,
    borderColor: Colors.G200,
    alignItems: "center",
    justifyContent: "center",
  },
  actorInitials: {
    fontSize: 8,
    fontWeight: "800",
    color: Colors.G700,
    letterSpacing: 0.3,
  },
  actorName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.SLATE500,
  },

  // ── Action line ──────────────────────────────────────────
  actionLine: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 3,
  },
  actionVerb: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  actionConnector: {
    fontSize: 13,
    fontWeight: "400",
    color: Colors.SLATE700,
  },
  entityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  entityPillText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  // ── Timestamp ────────────────────────────────────────────
  timestamp: {
    fontSize: 11,
    color: Colors.SLATE500,
    fontWeight: "500",
    paddingTop: 2,
    flexShrink: 0,
  },
});
