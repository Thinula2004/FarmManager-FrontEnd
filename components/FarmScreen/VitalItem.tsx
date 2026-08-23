import { StyleSheet, Text, View } from "react-native";
import Colors from "../../services/ColorPalette";

export default function VitalItem({
  label,
  value,
  unit,
  color,
  bg,
  border,
}: {
  label: string;
  value: string;
  unit?: string;
  color: string;
  bg: string;
  border?: string;
}) {
  return (
    <View
      style={[
        vital.item,
        { backgroundColor: bg, borderColor: border, borderWidth: 1 },
      ]}
    >
      <Text style={[vital.value, { color }]}>
        {value}
        {unit ? <Text style={vital.unit}> {unit}</Text> : null}
      </Text>
      <Text style={vital.label}>{label}</Text>
    </View>
  );
}
const vital = StyleSheet.create({
  item: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-around",
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 7,
  },
  unit: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
