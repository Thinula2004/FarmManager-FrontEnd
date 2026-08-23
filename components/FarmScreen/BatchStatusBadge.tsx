import { StyleSheet, Text, View } from "react-native";
import Colors from "../../services/ColorPalette";

export default function BatchStatusBadge({
  status,
}: {
  status: "Ongoing" | "Partially Sold" | "Completed";
}) {
  const map: Record<
    "Ongoing" | "Partially Sold" | "Completed",
    { bg: string; text: string; dot: string; label: string }
  > = {
    Ongoing: {
      bg: Colors.G100,
      text: Colors.G900,
      dot: Colors.G500,
      label: "Ongoing",
    },
    "Partially Sold": {
      bg: Colors.AMBER100,
      text: Colors.AMBER800,
      dot: Colors.AMBER500,
      label: "Partial Sale",
    },
    Completed: {
      bg: Colors.SLATE200,
      text: Colors.SLATE700,
      dot: Colors.SLATE500,
      label: "Completed",
    },
  };
  const c = map[status];
  return (
    <View style={[sb.wrap, { backgroundColor: c.bg }]}>
      <View style={[sb.dot, { backgroundColor: c.dot }]} />
      <Text style={[sb.text, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: "700" },
});
