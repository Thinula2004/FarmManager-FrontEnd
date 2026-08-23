import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Colors from "../../services/ColorPalette";

export default function InfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={chip.wrap}>
      <View style={chip.iconWrap}>
        <Ionicons name={icon} size={16} color={Colors.G700} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={chip.label}>{label}</Text>
        <Text style={chip.value} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}
const chip = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    padding: 12,
    flex: 1,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.G50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.G100,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.SLATE700,
    lineHeight: 17,
  },
});
