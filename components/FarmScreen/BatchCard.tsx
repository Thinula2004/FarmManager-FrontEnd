import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../services/ColorPalette";
import { Ionicons } from "@expo/vector-icons";
import Batch from "../../models/Batch";
import { formatWeight, getDaysSince } from "../../services/Util";
import { navigateFromStack } from "../../navigation/navigator";
import User from "../../models/User";

function daysAgo(rawDate: string): string {
  if (!rawDate) return "-";
  const date = new Date(rawDate);
  const d = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

type BatchStatus = "Ongoing" | "Completed";

const STATUS_CONFIG: Record<
  BatchStatus,
  {
    bg: string;
    text: string;
    dot: string;
    circleBg: string;
    circleText: string;
    circleBorder: string;
  }
> = {
  Ongoing: {
    bg: Colors.G100,
    text: Colors.G700,
    dot: Colors.G500,
    circleBg: Colors.G50,
    circleText: Colors.G700,
    circleBorder: Colors.G700,
  },
  Completed: {
    bg: Colors.AMBER100,
    text: Colors.AMBER600,
    dot: Colors.AMBER500,
    circleBg: Colors.AMBER50,
    circleText: Colors.AMBER600,
    circleBorder: Colors.AMBER600,
  },
};

function fcrColor(fcr: number): string {
  if (fcr < 1.6) return Colors.G700;
  if (fcr < 1.9) return Colors.AMBER600;
  return Colors.RED600;
}

export default function BatchCard({
  batch,
  onDelete,
  user,
  isFirst,
}: {
  batch: Batch;
  onDelete: (batchId: string) => {};
  user: User | null;
  isFirst: boolean;
}) {
  const isOngoing = batch.status === "Ongoing";
  const fcrDisplay = isOngoing
    ? `~${batch.fcr.toFixed(3)}`
    : batch.fcr.toFixed(3);

  const status =
    STATUS_CONFIG[batch.getStatus as BatchStatus] ?? STATUS_CONFIG.Ongoing;
  const ageDays = getDaysSince(batch.inDate);

  const handleDelete = () => {
    Alert.alert(
      "Delete Batch",
      "Are you sure you want to delete this Batch? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(batch.id);
          },
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      style={c.card}
      onPress={() => navigateFromStack("Batch", { batchId: batch.id })}
      activeOpacity={0.78}
    >
      <View style={c.header}>
        <View style={c.headerLeft}>
          <Text style={c.name}>{batch.name}</Text>

          <View style={c.breedRow}>
            <Ionicons name="paw-outline" size={13} color={Colors.SLATE500} />
            <Text style={c.breed}>
              {batch.breed.name}
              {batch.subBreed ? (
                <Text style={c.subBreed}> · {batch.subBreed}</Text>
              ) : null}
            </Text>
          </View>

          <View style={[c.statusPill, { backgroundColor: status.bg }]}>
            <View style={[c.statusDot, { backgroundColor: status.dot }]} />
            <Text style={[c.statusText, { color: status.text }]}>
              {batch.getStatus}
            </Text>
          </View>
        </View>

        <View
          style={[
            c.ageCircle,
            {
              backgroundColor: status.circleBg,
              borderColor: status.circleBorder,
            },
          ]}
        >
          <Text style={[c.ageDays, { color: status.circleText }]}>
            {ageDays}
          </Text>
          <Text style={[c.ageLabel, { color: status.circleText }]}>DAYS</Text>
        </View>
      </View>

      <View style={c.statsStrip}>
        <View style={c.statItem}>
          <Text style={[c.statValue, { color: Colors.G700 }]}>
            {batch.liveChicks.toLocaleString()}
          </Text>
          <Text style={c.statLabel}>Live Chicks</Text>
        </View>

        <View style={c.statRule} />

        <View style={c.statItem}>
          <Text style={c.statValue}>
            {formatWeight(batch.avgWeight, false)}
          </Text>
          <Text style={c.statLabel}>
            Avg Wt ({batch.avgWeight >= 1000 ? "KG" : "G"})
          </Text>
        </View>

        <View style={c.statRule} />

        <View style={c.statItem}>
          <Text style={[c.statValue, { color: Colors.RED600 }]}>
            {batch.totalMortality.toLocaleString()}
          </Text>
          <Text style={c.statLabel}>Mortality</Text>
        </View>

        <View style={c.statRule} />

        <View style={c.statItem}>
          <Text style={[c.statValue, { color: fcrColor(batch.fcr) }]}>
            {fcrDisplay}
          </Text>
          <Text style={c.statLabel}>FCR</Text>
        </View>
      </View>

      <View style={c.footer}>
        <View style={c.lastVisitRow}>
          <Ionicons name="time-outline" size={13} color={Colors.SLATE500} />
          <Text style={c.lastVisitText}>
            Last visit:{" "}
            <Text style={c.lastVisitVal}>{daysAgo(batch.lastVisit)}</Text>
          </Text>
        </View>
        {user && user.role == "owner" && isFirst && (
          <View style={{ flexDirection: "row", gap: 4 }}>
            <TouchableOpacity
              style={c.deleteBtn}
              onPress={() => {
                handleDelete();
              }}
            >
              <Ionicons name="trash" size={16} color={Colors.RED600} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const c = StyleSheet.create({
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: Colors.SLATE900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
    paddingBottom: 14,
  },
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.3,
  },
  breedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  breed: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.SLATE500,
  },
  subBreed: {
    fontWeight: "500",
    color: Colors.SLATE500,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 2,
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

  ageCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ageDays: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 22,
  },
  ageLabel: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 2,
  },

  statsStrip: {
    flexDirection: "row",
    backgroundColor: Colors.G50,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.G100,
    paddingVertical: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statRule: {
    width: 1,
    backgroundColor: Colors.G200,
    marginVertical: 10,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  lastVisitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  lastVisitText: {
    fontSize: 12,
    color: Colors.SLATE500,
    fontWeight: "500",
  },
  lastVisitVal: {
    fontWeight: "700",
    color: Colors.SLATE700,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.RED50,
    borderWidth: 1,
    borderColor: Colors.RED100,
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 10,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.G700,
  },
});
