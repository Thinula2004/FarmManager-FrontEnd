import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../services/ColorPalette";
import Visit from "../../models/Visit";
import {
  formatDate,
  formatWeight,
  showToast,
  stringToDate,
} from "../../services/Util";
import VisitStatCell from "./VisitStatCell";
import { deleteVisit } from "../../controllers/visitController";

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function VisitCard({
  visit,
  isLast,
  refresh,
  onView,
}: {
  visit: Visit;
  isLast: boolean;
  refresh: () => void;
  onView: (visit: Visit) => void;
}) {
  const fcrColor =
    visit.FCR < 1.6
      ? Colors.G700
      : visit.FCR < 1.9
        ? Colors.AMBER600
        : Colors.RED600;

  const mortalityColor = visit.mortality > 10 ? Colors.RED600 : Colors.SLATE900;

  const lowFeed = visit.remainingFeed < 50;

  const handleDelete = () => {
    Alert.alert(
      "Delete Visit",
      "Are you sure you want to delete this Visit? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteVisit(visit.id);
            if (success) {
              showToast("success", "Visit deleted successfully");
              refresh();
            }
          },
        },
      ],
    );
  };

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={s.badge}>
          <Text style={s.badgeEyebrow}>VISIT</Text>
          <Text style={s.badgeNumber}>#{visit.visitNumber}</Text>
        </View>

        <View style={s.headerMeta}>
          <Text style={s.date}>
            {formatDate(stringToDate(visit.visitedDate), "-")}
          </Text>

          <View style={s.officerRow}>
            <View style={s.officerAvatar}>
              <Text style={s.officerInitials}>
                {initials(visit.officer.name)}
              </Text>
            </View>
            <Text style={s.officerName}>{visit.officer.name}</Text>
          </View>
        </View>

        {isLast && (
          <TouchableOpacity
            style={s.deleteButton}
            activeOpacity={0.7}
            onPress={() => {
              handleDelete();
            }}
          >
            <Ionicons name="trash" size={18} color={Colors.RED600} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={s.viewButton}
          activeOpacity={0.7}
          onPress={() => {
            onView(visit);
          }}
        >
          <Ionicons name="eye" size={18} color={Colors.G700} />
        </TouchableOpacity>
      </View>

      <View style={s.statsStrip}>
        <VisitStatCell
          label="Avg Weight"
          value={`${formatWeight(visit.avgWeight)}`}
          valueColor={Colors.G700}
        />
        <View style={s.statDivider} />
        <VisitStatCell
          label="Mortality"
          value={`${visit.mortality}`}
          valueColor={mortalityColor}
        />
        <View style={s.statDivider} />
        <VisitStatCell
          label="FCR"
          value={visit.FCR.toFixed(3)}
          valueColor={fcrColor}
        />
      </View>

      <View style={s.feedRow}>
        <View style={[s.feedIconWrap, lowFeed && s.feedIconWrapLow]}>
          <Ionicons
            name="leaf"
            size={16}
            color={lowFeed ? Colors.AMBER600 : Colors.G700}
          />
        </View>
        <View style={s.feedText}>
          <Text style={s.feedType}>{visit.feedEntry.feedType}</Text>
          <Text style={[s.feedRemaining, lowFeed && s.feedRemainingLow]}>
            {visit.remainingFeed} kg remaining
          </Text>
        </View>
      </View>

      {visit.note ? (
        <View style={s.noteBox}>
          <Text style={s.noteEyebrow}>FIELD NOTE</Text>
          <Text style={s.noteText}>{visit.note}</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },

  badge: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: Colors.G700,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
  },
  badgeEyebrow: {
    fontSize: 7,
    fontWeight: "800",
    color: Colors.G200,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    lineHeight: 10,
  },
  badgeNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.WHITE,
    letterSpacing: -0.5,
    lineHeight: 22,
  },

  headerMeta: { flex: 1 },
  date: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.SLATE900,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  officerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  officerAvatar: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },
  officerInitials: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.G700,
    letterSpacing: 0.3,
  },
  officerName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.SLATE500,
  },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: Colors.RED50,
    borderWidth: 1,
    borderColor: Colors.RED600 + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  viewButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G700 + "30",
    alignItems: "center",
    justifyContent: "center",
  },

  statsStrip: {
    flexDirection: "row",
    backgroundColor: Colors.G50,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.G100,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.G100,
    marginVertical: 10,
  },

  feedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.SLATE200,
  },
  feedIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },
  feedIconWrapLow: {
    backgroundColor: Colors.AMBER100,
  },
  feedText: { flex: 1 },
  feedType: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.SLATE900,
    marginBottom: 2,
  },
  feedRemaining: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.G600,
  },
  feedRemainingLow: {
    color: Colors.AMBER600,
  },

  noteBox: {
    margin: 12,
    backgroundColor: Colors.G50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.G100,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noteEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.G600,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: Colors.SLATE700,
    fontWeight: "500",
    lineHeight: 20,
  },
});
