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
import Chillout from "../../models/Chillout";
import { formatDate, showToast, stringToDate } from "../../services/Util";
import Batch from "../../models/Batch";
import { deleteChillout } from "../../controllers/chilloutController";

type Props = {
  chillout: Chillout;
  canDelete: boolean;
  onDelete: () => void;
};

export default function ChilloutCard({ chillout, canDelete, onDelete }: Props) {
  const isFinal = chillout.isFinal;
  const avgWeight =
    chillout.count > 0 ? (chillout.weight / chillout.count).toFixed(2) : "—";

  const handleDelete = () => {
    Alert.alert(
      "Delete Chillout",
      "Are you sure you want to delete this Chillout? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "default",
          onPress: async () => {
            const success = await deleteChillout(chillout.id);
            if (success) {
              showToast("success", "Chillout deleted successfully");
              onDelete();
            }
          },
        },
      ],
    );
  };

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={[s.iconWrap, s.iconWrapFinal]}>
          <Ionicons name="cart-outline" size={18} color={Colors.WHITE} />
        </View>

        <View style={s.headerInfo}>
          <Text style={s.customer}>{chillout.customer}</Text>
          <View style={s.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={11}
              color={Colors.SLATE500}
            />
            <Text style={s.dateText}>
              {formatDate(stringToDate(chillout.date), "-")}
            </Text>
          </View>
        </View>

        {isFinal && (
          <View style={s.finalBadge}>
            <View style={s.finalBadgeDot} />
            <Text style={s.finalBadgeText}>Final sale</Text>
          </View>
        )}

        {canDelete && (
          <TouchableOpacity
            style={s.deleteBtn}
            activeOpacity={0.7}
            onPress={() => {
              handleDelete();
            }}
          >
            <Ionicons name="trash-outline" size={17} color={Colors.RED600} />
          </TouchableOpacity>
        )}
      </View>

      <View style={[s.statsStrip, s.statsStripFinal]}>
        <View style={s.statItem}>
          <Text style={[s.statValue, s.statValueFinal]}>
            {chillout.count.toLocaleString()}
          </Text>
          <Text style={s.statLabel}>Chicks sold</Text>
        </View>

        <View style={[s.statRule, s.statRuleFinal]} />

        <View style={s.statItem}>
          <Text style={s.statValue}>{chillout.weight.toLocaleString()} kg</Text>
          <Text style={s.statLabel}>Total weight</Text>
        </View>

        <View style={[s.statRule, s.statRuleFinal]} />

        <View style={s.statItem}>
          <Text style={s.statValue}>{avgWeight} kg</Text>
          <Text style={s.statLabel}>Avg / Chick</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    overflow: "hidden",
    marginBottom: 10,
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 11,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconWrapRegular: {
    backgroundColor: Colors.AMBER50,
    borderWidth: 1,
    borderColor: Colors.AMBER100,
  },
  iconWrapFinal: {
    backgroundColor: Colors.G700,
  },
  headerInfo: {
    flex: 1,
    gap: 3,
  },
  customer: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.2,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.SLATE500,
  },
  finalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.AMBER100,
    borderWidth: 1,
    borderColor: Colors.AMBER200,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  finalBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.AMBER500,
  },
  finalBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.AMBER800,
  },

  statsStrip: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 2,
  },
  statsStripFinal: {
    backgroundColor: Colors.G25,
    borderTopColor: Colors.G100,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    gap: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.SLATE900,
    letterSpacing: -0.5,
  },
  statValueRegular: {
    color: Colors.AMBER600,
  },
  statValueFinal: {
    color: Colors.G700,
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
    marginVertical: 10,
  },
  statRuleRegular: {
    backgroundColor: Colors.AMBER100,
  },
  statRuleFinal: {
    backgroundColor: Colors.G200,
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.RED50,
    borderWidth: 1,
    borderColor: Colors.RED100,
  },
});
