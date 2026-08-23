import { StyleSheet, Text, View } from "react-native";
import Colors from "../../services/ColorPalette";

export default function BatchStatCell({
  label,
  value,
  sub,
  valueColor,
  small,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
  small?: boolean;
}) {
  return (
    <View style={[sc.cell, small && sc.smallCell]}>
      <Text style={sc.label}>{label}</Text>
      <Text style={[sc.value, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      {sub ? <Text style={sc.sub}>{sub}</Text> : null}
    </View>
  );
}
const sc = StyleSheet.create({
  cell: {
    flex: 3,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  smallCell: {
    flex: 2,
  },
  cellHighlight: {
    backgroundColor: Colors.G50,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  icon: { marginBottom: 4 },
  label: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    textAlign: "center",
  },
  value: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.SLATE900,
    textAlign: "center",
    lineHeight: 18,
  },
  sub: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.SLATE500,
    marginTop: 1,
    textAlign: "center",
  },
});
