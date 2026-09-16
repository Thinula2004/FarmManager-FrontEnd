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
import Loader from "../Common/Loader";
import { formatDate, showToast, stringToDate } from "../../services/Util";
import AddVisitLastRecordedRow from "./AddVisitLastRecordedRow";
import Visit from "../../models/Visit";
import FeedEntry from "../../models/FeedEntry";
import AddVisitSectionLabel from "./AddVisitSectionLabel";
import AddVisitConfirmationOverlay from "./AddVisitConfirmationOverlay";

type Props = {
  visible: boolean;
  batch: Batch | null;
  lastVisit: Visit | null;
  feedEntries: FeedEntry[];
  onClose: () => void;
  onSaved: () => void;
};

type ConfirmData = {
  avgWeightG: number;
  mortality: number;
  feedRemainingKg: number;
  fcr: number;
  note: string;
};

function formatToday(): string {
  const d = new Date();
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

export default function AddVisitOverlay({
  visible,
  batch,
  lastVisit,
  feedEntries,
  onClose,
  onSaved,
}: Props) {
  const [testCount, setTestCount] = useState("0");
  const [totalWeight, setTotalWeight] = useState("0");
  const [mortality, setMortality] = useState("0");
  const [feedRemaining, setFeedRemaining] = useState("0");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmationData, setConfirmationData] = useState<ConfirmData | null>(
    null,
  );

  const lastFeedEntry = feedEntries.length > 0 ? feedEntries[0] : null;

  const todayLabel = useMemo(() => formatToday(), [visible]);

  useEffect(() => {
    if (visible) {
      setTestCount("0");
      setTotalWeight("0");
      setMortality("0");
      setFeedRemaining("0");
      setNote("");
      setErrors({});
      setConfirmationData(null); // reset confirmation step too
    }
  }, [visible]);

  const avgWeightKg = useMemo(() => {
    const count = parseFloat(testCount) || 0;
    const weight = parseFloat(totalWeight) || 0;
    if (count <= 0) return 0;
    return weight / count / 1000;
  }, [testCount, totalWeight]);

  const mortalityPct = useMemo(() => {
    const m = parseFloat(mortality) || 0;
    const initial = batch?.initialCount ?? 1;
    return (m / initial) * 100;
  }, [mortality, batch]);

  const totalMortality = useMemo(() => {
    const entered = parseFloat(mortality) || 0;
    const previous = batch?.totalMortality ?? 0;
    return previous + entered;
  }, [mortality, batch]);

  const totalMortalityPct = useMemo(() => {
    const initial = batch?.initialCount ?? 1;
    return (totalMortality / initial) * 100;
  }, [totalMortality, batch]);

  const feedConsumed = (): number => {
    const totalFeed = feedEntries.reduce(
      (total, entry) => total + (Number(entry.weight) || 0),
      0,
    );

    return parseFloat(feedRemaining) > 0
      ? totalFeed - parseFloat(feedRemaining)
      : totalFeed;
  };

  const fcr = useMemo(() => {
    if (!avgWeightKg || !batch) {
      return 0;
    }

    const liveChicks = Math.max(
      (batch.liveChicks ?? 0) - parseFloat(mortality || "0"),
      0,
    );

    const totalLiveWeight = avgWeightKg * liveChicks;

    const totalChilloutWeight = batch.totalChilloutWeight ?? 0;

    const totalWeightProduced = totalLiveWeight + totalChilloutWeight;

    if (totalWeightProduced <= 0) {
      return 0;
    }

    const val = feedConsumed() / totalWeightProduced;

    return val;
  }, [feedRemaining, testCount, totalWeight, mortality, batch]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    const tc = parseFloat(testCount);
    const tw = parseFloat(totalWeight);
    const m = parseFloat(mortality);
    const fr = parseFloat(feedRemaining);
    if (isNaN(tc) || tc <= 0) e.testCount = "Enter a valid count";
    if (isNaN(tw) || tw <= 0) e.totalWeight = "Enter a valid weight";
    if (isNaN(m) || m < 0) e.mortality = "Enter a valid number";
    if (isNaN(fr) || fr < 0) e.feedRemaining = "Enter a valid amount";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleSubmit = async () => {
    if (!validate() || !batch) return;
    setConfirmationData({
      avgWeightG: avgWeightKg * 1000,
      mortality: parseFloat(mortality),
      feedRemainingKg: parseFloat(feedRemaining),
      fcr: fcr,
      note: note,
    });
  };

  function resetFields() {
    setTestCount("0");
    setTotalWeight("0");
    setMortality("0");
    setFeedRemaining("0");
    setNote("");
    setErrors({});
    setConfirmationData(null);
  }

  function handleClose() {
    resetFields();
    onClose();
  }

  const highMortality = mortalityPct > 2;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={
        confirmationData ? () => setConfirmationData(null) : handleClose
      }
    >
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={s.kav}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable style={s.backdrop} onPress={handleClose} />
          <View style={s.sheet}>
            <View style={s.dragHandle} />

            <View style={s.sheetHeader}>
              <View style={s.headerLeft}>
                <View>
                  <Text style={s.headerTitle}>Record field visit</Text>
                  <Text style={s.headerSub}>
                    Log today's batch observations
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
              {/* Context row */}
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
                    <Text style={s.contextChipLabel}>FARM</Text>
                    <Text style={s.contextChipValue} numberOfLines={1}>
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
                    <Text style={s.contextChipLabel}>BATCH</Text>
                    <Text style={s.contextChipValue} numberOfLines={1}>
                      {batch?.name ?? "—"}
                    </Text>
                  </View>
                </View>
              </View>

              <AddVisitSectionLabel
                icon="calendar-outline"
                label="Visit date"
              />
              <View style={s.card}>
                <View style={s.fieldRow}>
                  <View style={[s.fieldIcon, s.fieldIconSlate]}>
                    <Ionicons
                      name="calendar-clear-outline"
                      size={16}
                      color={Colors.SLATE500}
                    />
                  </View>
                  <View style={s.fieldBody}>
                    <Text style={s.fieldLabel}>Date</Text>
                    <Text style={s.fieldValue}>{todayLabel}</Text>
                  </View>
                  <View style={s.todayBadge}>
                    <Text style={s.todayBadgeText}>Today</Text>
                  </View>
                </View>
              </View>

              <AddVisitSectionLabel
                icon="scale-outline"
                label="Average weight"
              />
              <View style={s.card}>
                <View style={s.equationBlock}>
                  <View style={s.eqCell}>
                    <Text style={s.eqCellLabel}>Total wt (g)</Text>
                    <View style={s.eqInputWrap}>
                      <TextInput
                        style={s.eqInput}
                        value={totalWeight}
                        onChangeText={(v) => {
                          setTotalWeight(v);
                          if (errors.totalWeight)
                            setErrors((e) => ({ ...e, totalWeight: "" }));
                        }}
                        keyboardType="decimal-pad"
                        selectTextOnFocus
                      />
                    </View>
                  </View>

                  <Text style={s.eqOperator}>÷</Text>
                  <View style={s.eqCell}>
                    <Text style={s.eqCellLabel}>Chick Count</Text>
                    <View style={s.eqInputWrap}>
                      <TextInput
                        style={s.eqInput}
                        value={testCount}
                        onChangeText={(v) => {
                          setTestCount(v);
                          if (errors.testCount)
                            setErrors((e) => ({ ...e, testCount: "" }));
                        }}
                        keyboardType="number-pad"
                        selectTextOnFocus
                      />
                    </View>
                  </View>

                  <Text style={s.eqOperator}>=</Text>

                  <View style={[s.eqCell, s.eqResultCell]}>
                    <Text style={s.eqCellLabel}>Avg weight</Text>
                    <View style={s.eqResultWrap}>
                      <Text style={s.eqResultValue}>
                        {avgWeightKg < 1
                          ? `${(avgWeightKg * 1000).toFixed(0)}`
                          : avgWeightKg.toFixed(2)}
                      </Text>
                      <Text style={s.eqResultUnit}>
                        {avgWeightKg < 1 ? "g / chick" : "kg / chick"}
                      </Text>
                    </View>
                  </View>
                </View>
                {(!!errors.testCount || !!errors.totalWeight) && (
                  <Text style={s.errorText}>
                    {errors.testCount || errors.totalWeight}
                  </Text>
                )}
              </View>

              <AddVisitSectionLabel
                icon="trending-down-outline"
                label="Mortality"
              />
              <View style={s.card}>
                {lastVisit && (
                  <AddVisitLastRecordedRow
                    label="Last recorded"
                    value={`${lastVisit ? lastVisit.mortality : "0"} Deaths`}
                    date={formatDate(stringToDate(lastVisit.visitedDate), "-")}
                  />
                )}

                <View style={[s.fieldRow, s.fieldRowBorder]}>
                  <View
                    style={[
                      s.fieldIcon,
                      {
                        backgroundColor: Colors.RED50,
                        borderColor: Colors.RED100,
                      },
                    ]}
                  >
                    <Ionicons
                      name="skull-outline"
                      size={18}
                      color={Colors.RED600}
                    />
                  </View>
                  <View style={s.fieldBody}>
                    <Text style={s.fieldLabel}>
                      {" "}
                      Deaths {lastVisit ? " since last visit" : ""}
                    </Text>
                    <TextInput
                      style={s.fieldInput}
                      value={mortality}
                      onChangeText={(v) => {
                        setMortality(v);
                        if (errors.mortality)
                          setErrors((e) => ({ ...e, mortality: "" }));
                      }}
                      keyboardType="number-pad"
                      selectTextOnFocus
                      placeholderTextColor={Colors.SLATE200}
                    />
                  </View>
                  <View style={{ height: 40, justifyContent: "flex-end" }}>
                    <View style={[s.pctBadge, highMortality && s.pctBadgeRed]}>
                      <Text
                        style={[
                          s.pctBadgeText,
                          highMortality && s.pctBadgeTextRed,
                        ]}
                      >
                        {mortalityPct.toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                </View>
                {!!errors.mortality && (
                  <Text style={s.errorText}>{errors.mortality}</Text>
                )}
                <View style={s.totalMortalityRow}>
                  <View style={s.totalMortalityLeft}>
                    <View style={s.totalMortalityIconWrap}>
                      <Ionicons
                        name="stats-chart"
                        size={13}
                        color={Colors.SLATE500}
                      />
                    </View>
                    <View>
                      <Text style={s.totalMortalityLabel}>
                        Batch total mortality
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      s.totalMortalityBadge,
                      totalMortalityPct > 5 && s.totalMortalityBadgeRed,
                      totalMortalityPct > 2 &&
                        totalMortalityPct <= 5 &&
                        s.totalMortalityBadgeAmber,
                    ]}
                  >
                    <Text
                      style={[
                        s.totalMortalityCount,
                        totalMortalityPct > 5 && s.totalMortalityCountRed,
                        totalMortalityPct > 2 &&
                          totalMortalityPct <= 5 &&
                          s.totalMortalityCountAmber,
                      ]}
                    >
                      {totalMortality.toLocaleString()}
                    </Text>
                    <Text
                      style={[
                        s.totalMortalityPct,
                        totalMortalityPct > 5 && s.totalMortalityCountRed,
                        totalMortalityPct > 2 &&
                          totalMortalityPct <= 5 &&
                          s.totalMortalityCountAmber,
                      ]}
                    >
                      {totalMortalityPct.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </View>

              <AddVisitSectionLabel icon="nutrition-outline" label="Feed" />
              <View style={s.card}>
                {lastFeedEntry && (
                  <AddVisitLastRecordedRow
                    label="Last feed entry"
                    value={lastFeedEntry ? lastFeedEntry.feedType : ""}
                    date={`${lastFeedEntry ? lastFeedEntry.weight : "0"} KG`}
                  />
                )}
                <View style={[s.fieldRow, s.fieldRowBorder]}>
                  <View style={[s.fieldIcon, s.fieldIconAmber]}>
                    <Ionicons
                      name="nutrition-outline"
                      size={18}
                      color={Colors.AMBER600}
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
                      keyboardType="decimal-pad"
                      selectTextOnFocus
                      placeholderTextColor={Colors.SLATE200}
                    />
                  </View>
                  <View style={{ height: 40, justifyContent: "flex-end" }}>
                    <View style={s.unitBadge}>
                      <Text style={s.unitBadgeText}>KG</Text>
                    </View>
                  </View>
                </View>
                {!!errors.feedRemaining && (
                  <Text style={s.errorText}>{errors.feedRemaining}</Text>
                )}
              </View>

              <AddVisitSectionLabel
                icon="analytics-outline"
                label="Feed conversion ratio"
              />
              <View style={s.card}>
                <View style={s.fcrRow}>
                  <View>
                    <Text style={s.fcrValue}>{fcr.toFixed(3)}</Text>
                    <Text style={s.fcrSub}>Approximate Value</Text>
                  </View>
                  <View style={s.fcrPendingBadge}>
                    <Text style={s.fcrPendingText}>FCR</Text>
                  </View>
                </View>
              </View>

              <AddVisitSectionLabel
                icon="document-text-outline"
                label="Field note"
              />
              <View style={s.noteCard}>
                <View style={s.noteHeader}>
                  <View style={s.noteIconWrap}>
                    <Ionicons
                      name="pencil-outline"
                      size={14}
                      color={Colors.G700}
                    />
                  </View>
                  <Text style={s.noteHeaderText}>
                    Observations &amp; remarks
                  </Text>
                  <Text style={s.noteOptional}>optional</Text>
                </View>

                <TextInput
                  style={s.noteInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Flock appears healthy with good uniformity. Slight respiratory sounds in the eastern section."
                  placeholderTextColor={Colors.SLATE300}
                  multiline
                  textAlignVertical="top"
                  returnKeyType="default"
                  blurOnSubmit={false}
                />

                {note.length > 0 && (
                  <View style={s.noteFooter}>
                    <View style={s.noteFooterDot} />
                    <Text style={s.noteCharCount}>
                      {note.length} characters
                    </Text>
                  </View>
                )}
              </View>

              {/* Submit */}
              <View style={s.submitBtn}>
                <TouchableOpacity
                  onPress={handleSubmit}
                  activeOpacity={0.85}
                  style={s.submitInner}
                >
                  <Text style={s.submitText}>Save Visit</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 8 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        {confirmationData && (
          <AddVisitConfirmationOverlay
            visitNumber={lastVisit ? lastVisit?.visitNumber + 1 : 1}
            batch={batch}
            avgWeightG={confirmationData.avgWeightG}
            mortality={confirmationData.mortality}
            feedRemainingKg={confirmationData.feedRemainingKg}
            fcr={confirmationData.fcr}
            note={confirmationData.note}
            onCancel={() => setConfirmationData(null)}
            onConfirm={() => {
              resetFields();
              onSaved();
            }}
          />
        )}
      </View>
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
    maxHeight: "90%",
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
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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

  contextRow: {
    flexDirection: "row",
    backgroundColor: Colors.G100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.G200,
    overflow: "hidden",
    marginBottom: 16,
  },
  contextChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 11,
  },
  contextChipIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.G700,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  contextChipLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.G700,
    letterSpacing: 1,
  },
  contextChipValue: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.G900,
    letterSpacing: -0.2,
    marginTop: 1,
  },
  contextDivider: {
    width: 1,
    backgroundColor: Colors.G200,
    marginVertical: 10,
  },

  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    overflow: "hidden",
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

  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  fieldRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.SLATE100,
  },
  fieldIcon: {
    width: 45,
    height: 45,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: 1,
  },
  fieldIconGreen: {
    backgroundColor: Colors.G50,
    borderColor: Colors.G100,
  },
  fieldIconAmber: {
    backgroundColor: Colors.AMBER50,
    borderColor: Colors.AMBER200,
  },
  fieldIconSlate: {
    backgroundColor: Colors.SLATE100,
    borderColor: Colors.SLATE200,
  },
  fieldBody: { flex: 1, gap: 3 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.SLATE500,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.SLATE900,
  },
  fieldInput: {
    marginTop: 4,
    paddingVertical: 3,
    paddingHorizontal: 15,
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G100,
    borderRadius: 10,
    width: 70,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: Colors.SLATE900,
    padding: 0,
    margin: 0,
  },

  todayBadge: {
    backgroundColor: Colors.SLATE100,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.SLATE500,
  },

  equationBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 2,
  },
  eqCell: { flex: 1, alignItems: "center", gap: 6 },
  eqResultCell: { flex: 1.1 },
  eqCellLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  eqInputWrap: {
    width: "100%",
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G100,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  eqInput: {
    fontSize: 17,
    fontWeight: "900",
    color: Colors.SLATE900,
    textAlign: "center",
    padding: 0,
    letterSpacing: -0.5,
    width: "100%",
  },
  eqOperator: {
    fontSize: 22,
    fontWeight: "300",
    color: Colors.SLATE500,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  eqResultWrap: {
    width: "100%",
    backgroundColor: Colors.G700,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  eqResultValue: {
    fontSize: 17,
    fontWeight: "900",
    color: Colors.WHITE,
    letterSpacing: -0.5,
  },
  eqResultUnit: {
    fontSize: 8,
    fontWeight: "700",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 2,
  },

  pctBadge: {
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G100,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pctBadgeRed: {
    backgroundColor: Colors.RED50,
    borderColor: Colors.RED100,
  },
  pctBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.G700,
  },
  pctBadgeTextRed: {
    color: Colors.RED600,
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

  fcrRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fcrValue: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.SLATE900,
    letterSpacing: -1,
  },
  fcrSub: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.SLATE500,
    marginTop: 3,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  fcrPendingBadge: {
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G100,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fcrPendingText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.G700,
    letterSpacing: 0.5,
  },

  // ── Field note card ───────────────────────────────────────
  noteCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    overflow: "hidden",
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
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.SLATE100,
  },
  noteIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },
  noteHeaderText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.SLATE700,
    letterSpacing: 0.3,
  },
  noteOptional: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors.SLATE500,
    fontStyle: "italic",
  },
  noteInput: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.SLATE900,
    lineHeight: 22,
    minHeight: 90,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },
  noteFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.SLATE100,
    paddingTop: 8,
  },
  noteFooterDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.G500,
  },
  noteCharCount: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.SLATE500,
  },

  errorText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.RED600,
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginTop: -2,
  },

  submitBtn: {
    overflow: "hidden",
    backgroundColor: Colors.G700,
    borderRadius: 16,
    marginTop: 16,
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
  submitInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: 0.1,
  },

  totalMortalityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.SLATE100,
    backgroundColor: Colors.WHITE,
    gap: 12,
  },
  totalMortalityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  totalMortalityIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    alignItems: "center",
    justifyContent: "center",
  },
  totalMortalityLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 1,
  },
  totalMortalityCalc: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.SLATE500,
  },
  totalMortalityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  totalMortalityBadgeAmber: {
    backgroundColor: Colors.AMBER50,
    borderColor: Colors.AMBER100,
  },
  totalMortalityBadgeRed: {
    backgroundColor: Colors.RED50,
    borderColor: Colors.RED100,
  },
  totalMortalityCount: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.SLATE700,
    letterSpacing: -0.5,
  },
  totalMortalityPct: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.SLATE500,
  },
  totalMortalityCountAmber: {
    color: Colors.AMBER600,
  },
  totalMortalityCountRed: {
    color: Colors.RED600,
  },
});
