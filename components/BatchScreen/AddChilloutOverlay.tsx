import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../services/ColorPalette";
import Batch from "../../models/Batch";
import DatePicker from "../Common/DatePicker";
import {
  addChillout,
  addFinalChillout,
} from "../../controllers/chilloutController";
import { showToast } from "../../services/Util";

type Props = {
  visible: boolean;
  batch: Batch | null;
  onClose: () => void;
};

function formatDateLabel(d: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function AddChilloutOverlay({ visible, batch, onClose }: Props) {
  const today = new Date();
  const liveChicks = batch?.liveChicks ?? 0;

  const [isFinal, setIsFinal] = useState(false);
  const [date, setDate] = useState(today);
  const [count, setCount] = useState("");
  const [customer, setCustomer] = useState("");
  const [totalWeight, setTotalWeight] = useState("");
  const [feedRemaining, setFeedRemaining] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setIsFinal(false);
      setDate(today);
      setCount("");
      setCustomer("");
      setTotalWeight("");
      setFeedRemaining("");
      setErrors({});
    }
  }, [visible]);

  const handleCountChange = (v: string) => {
    setCount(v);
    if (errors.count) setErrors((e) => ({ ...e, count: "" }));
    const num = parseFloat(v);
    if (!isNaN(num) && num >= liveChicks && liveChicks > 0) {
      setIsFinal(true);
    }
  };

  const handleToggleFinal = () => {
    const next = !isFinal;
    setIsFinal(next);
    if (next) {
      setErrors((e) => ({ ...e, count: "" }));
    }
    if (!next) {
      setCount("");
      setFeedRemaining("");
    }
  };

  const effectiveCount = isFinal ? liveChicks : parseFloat(count) || 0;

  function validate(): boolean {
    const e: Record<string, string> = {};

    if (!isFinal) {
      const c = parseFloat(count);
      if (isNaN(c) || c <= 0) e.count = "Enter a valid bird count";
      else if (c > liveChicks)
        e.count = `Cannot exceed live chicks (${liveChicks})`;
    }

    if (!customer.trim()) e.customer = "Customer name is required";

    const w = parseFloat(totalWeight);
    if (isNaN(w) || w <= 0) e.totalWeight = "Enter a valid weight";

    if (isFinal) {
      const fr = parseFloat(feedRemaining);
      if (isNaN(fr) || fr < 0)
        e.feedRemaining = "Enter a valid feed remaining amount";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate() || !batch) return;

    if (!isFinal) {
      const success = await addChillout(
        batch.id,
        date.toISOString(),
        effectiveCount,
        customer.trim(),
        parseFloat(totalWeight),
      );
      if (success) {
        showToast("success", "Chillout added successfully");
        handleClose();
      }
    } else {
      const success = await addFinalChillout(
        batch.id,
        date.toISOString(),
        effectiveCount,
        customer.trim(),
        parseFloat(totalWeight),
        parseFloat(feedRemaining),
      );
      if (success) {
        showToast("success", "Final chillout added successfully");
        handleClose();
      }
    }
  }

  function handleClose() {
    setIsFinal(false);
    setDate(today);
    setCount("");
    setCustomer("");
    setTotalWeight("");
    setFeedRemaining("");
    setErrors({});
    setShowDatePicker(false);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={s.backdrop} onPress={handleClose} />

        <View style={s.sheet}>
          <View style={s.dragHandle} />

          <View style={s.header}>
            <View style={s.headerLeft}>
              <View style={s.headerIcon}>
                <Ionicons name="cart-outline" size={20} color={Colors.WHITE} />
              </View>
              <View>
                <Text style={s.headerTitle}>Add chillout</Text>
                <Text style={s.headerSub}>
                  Record a bird sale for this batch
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={s.closeBtn}
              onPress={handleClose}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={18} color={Colors.SLATE500} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.scrollContent}
          >
            <View style={s.contextRow}>
              <View style={s.contextChip}>
                <View style={s.contextChipIcon}>
                  <Ionicons
                    name="storefront-outline"
                    size={14}
                    color={Colors.WHITE}
                  />
                </View>
                <View>
                  <Text style={s.contextLabel}>FARM</Text>
                  <Text style={s.contextValue} numberOfLines={1}>
                    {batch?.farm?.name ?? "—"}
                  </Text>
                </View>
              </View>
              <View style={s.contextDivider} />
              <View style={s.contextChip}>
                <View style={s.contextChipIcon}>
                  <Ionicons
                    name="layers-outline"
                    size={14}
                    color={Colors.WHITE}
                  />
                </View>
                <View>
                  <Text style={s.contextLabel}>BATCH</Text>
                  <Text style={s.contextValue} numberOfLines={1}>
                    {batch?.name ?? "—"}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[s.toggleCard, isFinal && s.toggleCardFinal]}
              onPress={handleToggleFinal}
              activeOpacity={0.8}
            >
              <View style={[s.checkbox, isFinal && s.checkboxChecked]}>
                {isFinal && (
                  <Ionicons name="checkmark" size={13} color={Colors.WHITE} />
                )}
              </View>

              <View style={s.toggleInfo}>
                <Text style={[s.toggleTitle, isFinal && s.toggleTitleFinal]}>
                  Final chillout
                </Text>
                <Text style={[s.toggleSub, isFinal && s.toggleSubFinal]}>
                  {isFinal
                    ? `All ${liveChicks.toLocaleString()} live chicks will be sold`
                    : "Mark this as the last sale"}
                </Text>
              </View>

              {isFinal && (
                <View style={s.finalPill}>
                  <View style={s.finalPillDot} />
                  <Text style={s.finalPillText}>Final</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={s.card}>
              <TouchableOpacity
                style={s.fieldRow}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <View style={[s.fieldIcon, s.fieldIconSlate]}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={Colors.SLATE500}
                  />
                </View>
                <View style={s.fieldBody}>
                  <Text style={s.fieldLabel}>Sale date</Text>
                  <Text style={s.fieldValue}>{formatDateLabel(date)}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.SLATE500}
                />
              </TouchableOpacity>

              <View
                style={[
                  s.fieldRow,
                  s.fieldRowBorder,
                  !!errors.count && s.fieldRowError,
                ]}
              >
                <View
                  style={[
                    s.fieldIcon,
                    isFinal ? s.fieldIconLocked : s.fieldIconGreen,
                  ]}
                >
                  <Ionicons
                    name={isFinal ? "lock-closed-outline" : "egg-outline"}
                    size={16}
                    color={isFinal ? Colors.SLATE500 : Colors.G700}
                  />
                </View>
                <View style={s.fieldBody}>
                  <View style={s.fieldLabelRow}>
                    <Text style={s.fieldLabel}>Bird count</Text>
                    {isFinal && (
                      <Text style={s.lockedTag}> · locked to live chicks</Text>
                    )}
                  </View>
                  {isFinal ? (
                    <Text style={s.fieldValueLocked}>
                      {liveChicks.toLocaleString()}
                    </Text>
                  ) : (
                    <TextInput
                      style={s.fieldInput}
                      value={count}
                      onChangeText={handleCountChange}
                      placeholder={`Max ${liveChicks.toLocaleString()}`}
                      placeholderTextColor={Colors.SLATE200}
                      keyboardType="number-pad"
                      selectTextOnFocus
                    />
                  )}
                </View>
                {isFinal && (
                  <Ionicons
                    name="lock-closed"
                    size={15}
                    color={Colors.SLATE200}
                  />
                )}
              </View>
              {!!errors.count && (
                <Text style={s.errorText}>{errors.count}</Text>
              )}

              <View
                style={[
                  s.fieldRow,
                  s.fieldRowBorder,
                  !!errors.customer && s.fieldRowError,
                ]}
              >
                <View style={[s.fieldIcon, s.fieldIconGreen]}>
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={Colors.G700}
                  />
                </View>
                <View style={s.fieldBody}>
                  <Text style={s.fieldLabel}>Customer</Text>
                  <TextInput
                    style={s.fieldInput}
                    value={customer}
                    onChangeText={(v) => {
                      setCustomer(v);
                      if (errors.customer)
                        setErrors((e) => ({ ...e, customer: "" }));
                    }}
                    placeholder="e.g. Nimal Traders"
                    placeholderTextColor={Colors.SLATE200}
                    returnKeyType="next"
                  />
                </View>
              </View>
              {!!errors.customer && (
                <Text style={s.errorText}>{errors.customer}</Text>
              )}

              <View
                style={[
                  s.fieldRow,
                  s.fieldRowBorder,
                  !!errors.totalWeight && s.fieldRowError,
                ]}
              >
                <View style={[s.fieldIcon, s.fieldIconAmber]}>
                  <Ionicons
                    name="scale-outline"
                    size={16}
                    color={Colors.AMBER600}
                  />
                </View>
                <View style={s.fieldBody}>
                  <Text style={s.fieldLabel}>Total weight</Text>
                  <TextInput
                    style={s.fieldInput}
                    value={totalWeight}
                    onChangeText={(v) => {
                      setTotalWeight(v);
                      if (errors.totalWeight)
                        setErrors((e) => ({ ...e, totalWeight: "" }));
                    }}
                    placeholder="e.g. 9800"
                    placeholderTextColor={Colors.SLATE200}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                  />
                </View>
                <View style={s.unitBadge}>
                  <Text style={s.unitBadgeText}>kg</Text>
                </View>
              </View>
              {!!errors.totalWeight && (
                <Text style={s.errorText}>{errors.totalWeight}</Text>
              )}

              {isFinal && (
                <>
                  <View
                    style={[
                      s.fieldRow,
                      s.fieldRowBorder,
                      !!errors.feedRemaining && s.fieldRowError,
                    ]}
                  >
                    <View style={[s.fieldIcon, s.fieldIconGreen]}>
                      <Ionicons
                        name="leaf-outline"
                        size={16}
                        color={Colors.G700}
                      />
                    </View>
                    <View style={s.fieldBody}>
                      <Text style={s.fieldLabel}>Feed remaining</Text>
                      <TextInput
                        style={s.fieldInput}
                        value={feedRemaining}
                        onChangeText={(v) => {
                          setFeedRemaining(v);
                          if (errors.feedRemaining)
                            setErrors((e) => ({ ...e, feedRemaining: "" }));
                        }}
                        placeholder="e.g. 120"
                        placeholderTextColor={Colors.SLATE200}
                        keyboardType="decimal-pad"
                        selectTextOnFocus
                      />
                    </View>
                    <View style={s.unitBadge}>
                      <Text style={s.unitBadgeText}>kg</Text>
                    </View>
                  </View>
                  {!!errors.feedRemaining && (
                    <Text style={s.errorText}>{errors.feedRemaining}</Text>
                  )}

                  <View style={s.finalInfoBanner}>
                    <Ionicons
                      name="information-circle-outline"
                      size={15}
                      color={Colors.G700}
                    />
                    <Text style={s.finalInfoText}>
                      This will mark the batch as Completed after saving.
                    </Text>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[s.submitBtn, isFinal && s.submitBtnFinal]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={s.submitText}>
                {isFinal ? "Save Final Chillout" : "Save Chillout"}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 8 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DatePicker
          date={date}
          setDate={setDate}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </Modal>
  );
}

const s = StyleSheet.create({
  kav: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.5)",
  },

  sheet: {
    backgroundColor: Colors.G50,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    ...Platform.select({
      ios: {
        shadowColor: Colors.SLATE900,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: { elevation: 20 },
    }),
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.G200,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 2,
  },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 16 },

  // ── Header ──────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.G700,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.SLATE500,
    fontWeight: "500",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.SLATE200,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Context ──────────────────────────────────────────────────
  contextRow: {
    flexDirection: "row",
    backgroundColor: Colors.G100,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.G200,
    overflow: "hidden",
    marginBottom: 12,
  },
  contextChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 10,
  },
  contextChipIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.G700,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  contextDivider: { width: 1, backgroundColor: Colors.G200, marginVertical: 8 },
  contextLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.G700,
    letterSpacing: 1,
  },
  contextValue: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.G900,
    letterSpacing: -0.2,
    marginTop: 1,
  },

  // ── Final toggle card ────────────────────────────────────────
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.G200,
    padding: 13,
    marginBottom: 12,
  },
  toggleCardFinal: {
    backgroundColor: Colors.AMBER50,
    borderColor: Colors.AMBER500,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.G700,
    backgroundColor: Colors.WHITE,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.G700,
    borderColor: Colors.G700,
  },
  toggleInfo: { flex: 1 },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.2,
  },
  toggleTitleFinal: { color: Colors.AMBER800 },
  toggleSub: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.SLATE500,
    marginTop: 2,
  },
  toggleSubFinal: { color: "#b45309" },
  finalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.AMBER100,
    borderWidth: 1,
    borderColor: Colors.AMBER200,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  finalPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.AMBER500,
  },
  finalPillText: { fontSize: 11, fontWeight: "700", color: Colors.AMBER800 },

  // ── Shared card ──────────────────────────────────────────────
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    overflow: "hidden",
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: Colors.SLATE900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },

  // ── Field rows ───────────────────────────────────────────────
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  fieldRowBorder: { borderTopWidth: 1, borderTopColor: Colors.SLATE100 },
  fieldRowError: { backgroundColor: "#fff8f8" },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: 1,
  },
  fieldIconGreen: { backgroundColor: Colors.G50, borderColor: Colors.G100 },
  fieldIconSlate: {
    backgroundColor: Colors.SLATE100,
    borderColor: Colors.SLATE200,
  },
  fieldIconAmber: {
    backgroundColor: Colors.AMBER50,
    borderColor: Colors.AMBER100,
  },
  fieldIconLocked: {
    backgroundColor: Colors.SLATE100,
    borderColor: Colors.SLATE200,
  },
  fieldBody: { flex: 1, gap: 3 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center" },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.SLATE500,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  lockedTag: {
    fontSize: 9,
    fontWeight: "600",
    color: Colors.AMBER500,
    letterSpacing: 0.3,
  },
  fieldValue: { fontSize: 14, fontWeight: "700", color: Colors.SLATE900 },
  fieldValueLocked: { fontSize: 14, fontWeight: "700", color: Colors.SLATE500 },
  fieldInput: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.SLATE900,
    padding: 0,
    margin: 0,
  },
  unitBadge: {
    backgroundColor: Colors.G100,
    borderWidth: 1,
    borderColor: Colors.G200,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.G700,
    letterSpacing: 0.5,
  },

  // ── Final info banner ────────────────────────────────────────
  finalInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.G50,
    borderTopWidth: 1,
    borderTopColor: Colors.G100,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  finalInfoText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.G700,
    flex: 1,
  },

  // ── Error ────────────────────────────────────────────────────
  errorText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.RED600,
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginTop: -2,
  },

  // ── Submit ───────────────────────────────────────────────────
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.G700,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 14,
    ...Platform.select({
      ios: {
        shadowColor: Colors.G900,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
      },
      android: { elevation: 5 },
    }),
  },
  submitBtnFinal: { backgroundColor: Colors.AMBER600 },
  submitText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: 0.1,
  },
});
