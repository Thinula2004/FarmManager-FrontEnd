import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Farm from "../models/Farm";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/navigator";
import { useNavigation } from "@react-navigation/native";
import HealthBadge from "./HealthBadge";

const G900 = "#14532D"; // darkest green – primary text accents
const G700 = "#15803D"; // main brand green
const G500 = "#22C55E"; // bright accent
const G100 = "#DCFCE7"; // light tint panels
const G50 = "#F0FDF4"; // page background

const SLATE = "#1E293B"; // primary text
const MUTED = "#64748B"; // secondary text
const BORDER = "#E2E8F0";
const WHITE = "#FFFFFF";

export default function FarmCard({ farm }: { farm: Farm }) {
  const highMortality = farm.mortalityRate > 10;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={() => {
        navigation.navigate("Farm", {
          farm: farm,
        });
      }}
      activeOpacity={0.75}
    >
      {/* Header */}
      <View style={cardStyles.header}>
        <View style={cardStyles.iconWrap}>
          <Ionicons name="storefront" size={25} color={G900} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={cardStyles.farmName}>{farm.name}</Text>
          <Text style={cardStyles.location}>📍 {farm.city}</Text>
        </View>

        <HealthBadge status={farm.healthStatus} />
      </View>

      {/* Stats grid */}
      <View style={cardStyles.statsRow}>
        <View style={cardStyles.stat}>
          <Text style={cardStyles.statValue}>
            {farm.activeChicks.toLocaleString()}
          </Text>
          <Text style={cardStyles.statLabel}>Live Chicks</Text>
        </View>

        <View style={cardStyles.statDivider} />

        <View style={cardStyles.stat}>
          <Text
            style={[
              cardStyles.statValue,
              highMortality && { color: "#EF4444" },
            ]}
          >
            {farm.mortalityRate} %
          </Text>
          <Text style={cardStyles.statLabel}>Mortality</Text>
        </View>

        <View style={cardStyles.statDivider} />

        <View style={cardStyles.stat}>
          <Text style={cardStyles.statValue}>{farm.avgWeight} g</Text>
          <Text style={cardStyles.statLabel}>Avg Weight</Text>
        </View>

        <View style={cardStyles.statDivider} />

        <View style={cardStyles.stat}>
          <Text style={cardStyles.statValue}>Day {farm.batchAge}</Text>
          <Text style={cardStyles.statLabel}>Batch Age</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={cardStyles.footer}>
        <Text style={cardStyles.lastVisit}>
          🕐 Last visit: {farm.lastVisit}
        </Text>
        <View style={cardStyles.detailsBtn}>
          <Text style={cardStyles.detailsBtnText}>Details →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: G100,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 24 },

  farmName: {
    fontSize: 16,
    fontWeight: "700",
    color: SLATE,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: MUTED,
    fontWeight: "500",
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: G50,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: G100,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },

  stat: { flex: 1, alignItems: "center" },

  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: SLATE,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 10,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },

  statDivider: {
    width: 1,
    backgroundColor: G100,
    marginVertical: 2,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lastVisit: {
    fontSize: 12,
    color: MUTED,
    fontWeight: "500",
  },
  detailsBtn: {
    backgroundColor: G100,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  detailsBtnText: {
    fontSize: 12,
    color: G700,
    fontWeight: "700",
  },
});
