import { StyleSheet, Text, View } from "react-native";
import Colors from "../../services/ColorPalette";

export default function HealthBadge({
  status,
}: {
  status: "Active" | "Partially Active" | "Inactive";
}) {
  const map = {
    Active: { bg: Colors.G100, text: Colors.G900, dot: Colors.G500 },
    "Partially Active": { bg: "#FEF9C3", text: "#92400E", dot: "#EAB308" },
    Inactive: { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  };
  const c = map[status];
  return (
    <View style={[badge.wrap, { backgroundColor: c.bg }]}>
      <View style={[badge.dot, { backgroundColor: c.dot }]} />
      <Text style={[badge.text, { color: c.text }]}>{status}</Text>
    </View>
  );
}
const badge = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: 12, fontWeight: "700" },
});
