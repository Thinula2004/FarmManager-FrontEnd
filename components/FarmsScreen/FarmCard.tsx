import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../../services/ColorPalette";
import Farm from "../../models/Farm";

interface FarmCardProps {
  farm: Farm;
  onEdit: () => void;
  onDelete: () => void;
}

export default function FarmCard({ farm, onEdit, onDelete }: FarmCardProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="storefront" size={20} color={Colors.G700} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{farm.name}</Text>

            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={12}
                color={Colors.SLATE500}
              />

              <Text style={styles.locationText}>{farm.city}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={onEdit}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={15} color={Colors.G700} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={onDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={18} color={Colors.RED600} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="home-outline" size={13} color={Colors.SLATE500} />

            <Text style={styles.detailText} numberOfLines={1}>
              {farm.address}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={13} color={Colors.SLATE500} />

            <Text style={styles.detailText}>{farm.customer}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="call-outline" size={13} color={Colors.SLATE500} />

            <Text style={styles.detailText}>{farm.tel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: Colors.WHITE,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    overflow: "hidden",

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },

      android: {
        elevation: 3,
      },
    }),
  },

  accentBar: {
    width: 5,
    backgroundColor: "transparent",
  },

  body: {
    flex: 1,
    padding: 16,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },

  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.SLATE900,
    marginBottom: 3,
    letterSpacing: -0.2,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  locationText: {
    fontSize: 12,
    color: Colors.SLATE500,
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    gap: 8,
  },

  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.RED50,
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: 1,
    backgroundColor: Colors.SLATE100,
    marginBottom: 12,
  },

  detailGrid: {
    gap: 7,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  detailText: {
    fontSize: 13,
    color: Colors.SLATE500,
    fontWeight: "500",
    flex: 1,
  },
});
