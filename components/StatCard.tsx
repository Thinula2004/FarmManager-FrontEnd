import { StyleSheet, Text, View } from "react-native";

const G900 = "#14532D"; // darkest green – primary text accents
const G700 = "#15803D"; // main brand green
const G500 = "#22C55E"; // bright accent
const G100 = "#DCFCE7"; // light tint panels
const G50 = "#F0FDF4"; // page background

const SLATE = "#1E293B"; // primary text
const MUTED = "#64748B"; // secondary text
const BORDER = "#E2E8F0";
const WHITE = "#FFFFFF";

export default function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginVertical: 5,
  },
  label: {
    textAlign: "center",
    fontSize: 15,
    color: "#6b7280",
  },
  value: {
    marginBottom: 5,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
});
