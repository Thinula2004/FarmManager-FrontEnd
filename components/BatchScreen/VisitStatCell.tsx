import { StyleSheet, Text, View } from "react-native";
import Colors from "../../services/ColorPalette";

export default function VisitStatCell({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={stat.cell}>
      <Text style={[stat.value, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

const stat = StyleSheet.create({
  cell: { flex: 1, alignItems: "center", paddingVertical: 14 },
  value: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.G700,
    marginBottom: 5,
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
