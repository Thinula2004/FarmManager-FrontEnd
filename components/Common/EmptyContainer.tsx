import { StyleSheet, Text, View } from "react-native";
import Colors from "../../services/ColorPalette";

interface Props {
  title: string;
  body: string;
  withBG?: boolean;
}

export default function EmptyContainer({ title, body, withBG = false }: Props) {
  return (
    <View
      style={[
        styles.emptyContainer,
        withBG && { backgroundColor: Colors.WHITE },
      ]}
    >
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginVertical: 15,
    borderRadius: 20,
    borderStyle: "dashed",
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: Colors.G50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.G100,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.SLATE700,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.SLATE500,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 19,
  },
});
