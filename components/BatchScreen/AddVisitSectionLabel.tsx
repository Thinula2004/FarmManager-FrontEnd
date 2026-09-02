import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Colors from "../../services/ColorPalette";

export default function AddVisitSectionLabel({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={s.secLabel}>
      <View style={s.secIconWrap}>
        <Ionicons name={icon} size={13} color={Colors.G700} />
      </View>
      <Text style={s.secLabelText}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  secLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 16,
    marginBottom: 8,
  },
  secIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },
  secLabelText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.G700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
