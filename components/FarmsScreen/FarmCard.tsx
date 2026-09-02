import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../../services/ColorPalette";
import Farm from "../../models/Farm";
import Loader from "../Common/Loader";
import { useState } from "react";
import { closeFarm, openFarm } from "../../controllers/farmController";

interface FarmCardProps {
  farm: Farm;
  onEdit: () => void;
  onRefresh: () => void;
}

export default function FarmCard({ farm, onEdit, onRefresh }: FarmCardProps) {
  const [toggleLoading, setToggleLoading] = useState(false);

  const handleToggle = () => {
    setToggleLoading(true);
    const isGonnaOpen = !farm.isOpen;
    Alert.alert(
      isGonnaOpen ? "Open Farm" : "Close Farm",
      `Are you sure you want to ${isGonnaOpen ? "OPEN" : "CLOSE"} "${farm.name}"? This cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            setToggleLoading(false);
          },
        },
        {
          text: isGonnaOpen ? "Open" : "Close",
          style: isGonnaOpen ? "default" : "destructive",
          onPress: async () => {
            if (isGonnaOpen) {
              const success = await openFarm(farm.id);
              if (success) {
                onRefresh();
              }
            } else {
              const success = await closeFarm(farm.id);
              if (success) {
                onRefresh();
              }
            }
            setToggleLoading(false);
          },
        },
      ],
    );
  };

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
              style={[
                styles.toggle,
                farm.isOpen ? styles.toggleOn : styles.toggleOff,
              ]}
              onPress={() => {
                handleToggle();
              }}
              activeOpacity={0.85}
              disabled={toggleLoading}
            >
              {toggleLoading ? (
                <Loader
                  visible
                  foreground={farm.isOpen ? Colors.G700 : Colors.SLATE500}
                  background="transparent"
                />
              ) : (
                <Animated.View
                  style={[
                    styles.toggleDot,
                    farm.isOpen ? styles.toggleDotOn : styles.toggleDotOff,
                  ]}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={onEdit}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={15} color={Colors.G700} />
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.deleteBtn}
              onPress={onDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={18} color={Colors.RED600} />
            </TouchableOpacity> */}
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

  toggle: {
    width: 48,
    height: 34,
    borderRadius: 13,
    paddingHorizontal: 3,
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
  },
  toggleOn: {
    backgroundColor: Colors.G100,
    borderColor: Colors.G300,
    alignItems: "flex-end",
  },
  toggleOff: {
    backgroundColor: Colors.SLATE100,
    borderColor: Colors.SLATE200,
    alignItems: "flex-start",
  },
  toggleDot: {
    width: 25,
    height: 25,
    borderRadius: 10,
  },
  toggleDotOn: {
    backgroundColor: Colors.G600,
    ...Platform.select({
      ios: {
        shadowColor: Colors.G700,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  toggleDotOff: {
    backgroundColor: Colors.SLATE400,
  },
});
