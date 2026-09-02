import { StyleSheet, Text, View } from "react-native";
import Colors from "../../services/ColorPalette";

export default function AddVisitLastRecordedRow({
  label,
  value,
  date,
}: {
  label: string;
  value: string;
  date: string;
}) {
  return (
    <View style={s.lastRow}>
      <View style={s.lastLeft}>
        <Text style={s.lastLabel}>{label}</Text>
      </View>
      <View style={s.lastRight}>
        <Text style={s.lastValue}>{value}</Text>
        <Text style={s.lastDate}> · {date}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  lastRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  lastLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  lastLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  lastRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastValue: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.G900,
  },
  lastDate: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.SLATE500,
  },
});
