import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../services/ColorPalette";
import Batch from "../../models/Batch";
import { formatTime, showToast } from "../../services/Util";
import { addVisit } from "../../controllers/visitController";
import Loader from "../Common/Loader";
import { useState } from "react";

type Props = {
  visitNumber: number;
  batch: Batch | null;
  avgWeightG: number;
  mortality: number;
  feedRemainingKg: number;
  fcr: number;
  note?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function fcrColor(fcr: number): string {
  if (fcr <= 0) return Colors.SLATE500;
  if (fcr < 1.6) return Colors.G700;
  if (fcr < 1.9) return Colors.AMBER600;
  return Colors.RED600;
}

function formatWeight(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
  return `${Math.round(grams)} g`;
}

export default function AddVisitConfirmationOverlay({
  visitNumber,
  batch,
  avgWeightG,
  mortality,
  feedRemainingKg,
  fcr,
  note,
  onCancel,
  onConfirm,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    if (!batch) {
      return;
    }
    Alert.alert(
      "Record Visit",
      "Are you sure you want to record this Visit? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "default",
          onPress: async () => {
            setLoading(true);
            const currentTime = new Date().toISOString();
            try {
              const success = await addVisit(
                batch.id,
                currentTime,
                feedRemainingKg,
                mortality,
                avgWeightG,
                fcr,
                note,
              );
              if (success) {
                showToast("success", "Visit recorded successfully");
                onConfirm();
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={s.backdropWrap} pointerEvents="box-none">
      <View style={s.backdrop} />

      <View style={s.center} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onCancel} />
        <View style={s.card}>
          <View style={s.header}>
            <View style={s.ringA} />
            <View style={s.ringB} />

            <View style={s.ctxRow}>
              <View style={s.ctxChip}>
                <Text style={s.ctxLabel}>FARM</Text>
                <Text style={s.ctxValue} numberOfLines={1}>
                  {batch?.farm.name}
                </Text>
              </View>
              <View style={s.ctxChip}>
                <Text style={s.ctxLabel}>BATCH</Text>
                <Text style={s.ctxValue} numberOfLines={1}>
                  {batch?.name}
                </Text>
              </View>
            </View>

            <View style={s.visitRow}>
              <View>
                <Text style={s.visitTitle}>Visit #{visitNumber}</Text>
                <Text style={s.visitDate}>{formatTime(new Date())}</Text>
              </View>
              <View style={s.confirmBadge}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={14}
                  color="rgba(255,255,255,0.75)"
                />
                <Text style={s.confirmBadgeText}>Review below</Text>
              </View>
            </View>
          </View>

          <View style={s.statsGrid}>
            <View style={[s.statCell, s.statCellBorderRight]}>
              <Text style={s.statLabel}>Avg weight</Text>
              <Text style={[s.statValue, { color: Colors.G700 }]}>
                {formatWeight(avgWeightG)}
              </Text>
            </View>
            <View style={s.statCell}>
              <Text style={s.statLabel}>Mortality</Text>
              <Text style={[s.statValue, { color: Colors.RED600 }]}>
                {mortality}
              </Text>
            </View>
            <View
              style={[s.statCell, s.statCellBorderTop, s.statCellBorderRight]}
            >
              <Text style={s.statLabel}>Feed remaining</Text>
              <Text style={s.statValue}>{feedRemainingKg} kg</Text>
            </View>
            <View style={[s.statCell, s.statCellBorderTop]}>
              <Text style={s.statLabel}>FCR</Text>
              <Text style={[s.statValue, { color: fcrColor(fcr) }]}>
                {fcr > 0 ? fcr.toFixed(3) : "—"}
              </Text>
            </View>
          </View>

          {!!note && (
            <View style={s.noteWrap}>
              <Text style={s.noteEyebrow}>FIELD NOTE</Text>
              <View style={s.noteInner}>
                <Text style={s.noteText} numberOfLines={3}>
                  {note}
                </Text>
              </View>
            </View>
          )}

          <View style={s.actions}>
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <View style={s.confirmBtn}>
              <Loader
                visible={loading}
                background={Colors.G700}
                foreground={Colors.WHITE}
              />
              <TouchableOpacity onPress={handleConfirm} activeOpacity={0.85}>
                <Text style={s.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  backdropWrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    elevation: 10, // keep above the form sheet on Android
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.5)",
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: Colors.WHITE,
    borderRadius: 22,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 28,
      },
      android: { elevation: 20 },
    }),
  },

  header: {
    backgroundColor: Colors.G900,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    overflow: "hidden",
  },
  ringA: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 24,
    borderColor: "rgba(255,255,255,0.07)",
  },
  ringB: {
    position: "absolute",
    bottom: -30,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 14,
    borderColor: "rgba(34,197,94,0.14)",
  },

  ctxRow: { flexDirection: "row", gap: 8, marginBottom: 12, zIndex: 2 },
  ctxChip: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  ctxLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  ctxValue: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: -0.2,
    marginTop: 2,
  },

  visitRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    zIndex: 2,
  },
  visitTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.WHITE,
    letterSpacing: -0.5,
  },
  visitDate: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
    marginTop: 2,
  },
  confirmBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  confirmBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: Colors.G50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.G100,
  },
  statCell: { width: "50%", paddingHorizontal: 14, paddingVertical: 12 },
  statCellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: Colors.G100,
  },
  statCellBorderTop: { borderTopWidth: 1, borderTopColor: Colors.G100 },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.SLATE500,
    textTransform: "uppercase" as const,
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 17,
    fontWeight: "900",
    color: Colors.SLATE900,
    letterSpacing: -0.5,
  },

  noteWrap: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.SLATE100,
  },
  noteEyebrow: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.G700,
    letterSpacing: 1,
    marginBottom: 6,
  },
  noteInner: {
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.G200,
  },
  noteText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.SLATE500,
    lineHeight: 18,
  },
  actions: { flexDirection: "row", gap: 8, padding: 12, paddingBottom: 14 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.SLATE100,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontSize: 13, fontWeight: "700", color: Colors.SLATE500 },
  confirmBtn: {
    overflow: "hidden",
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.G700,
    ...Platform.select({
      ios: {
        shadowColor: Colors.G900,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  confirmText: { fontSize: 13, fontWeight: "800", color: Colors.WHITE },
});
