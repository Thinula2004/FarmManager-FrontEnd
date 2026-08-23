import { StyleSheet, Text, View } from "react-native";

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
