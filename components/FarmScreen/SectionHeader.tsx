import { StyleSheet, Text, View } from "react-native";
import Colors from "../../services/ColorPalette";

export default function SectionHeader({
  title,
  badge,
}: {
  title: string;
  badge?: string;
}) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      {badge ? (
        <View style={sh.pill}>
          <Text style={sh.pillText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}
const sh = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.3,
  },
  pill: {
    backgroundColor: Colors.G100,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.G200,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.G700,
  },
});
