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
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../services/ColorPalette";
import Farm from "../../models/Farm";
import Batch from "../../models/Batch";
import FeedType from "../../models/FeedType";
import { addFeedEntry, getFeedTypes } from "../../controllers/feedController";
import { showToast } from "../../services/Util";

type Props = {
  visible: boolean;
  batch: Batch | null;
  onClose: () => void;
};

export default function AddFeedOverlay({ visible, batch, onClose }: Props) {
  const [selectedFeedType, setSelectedFeedType] = useState<FeedType | null>(
    null,
  );
  const [weight, setWeight] = useState("");
  const [showFeedSheet, setShowFeedSheet] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedTypes, setFeedTypes] = useState<FeedType[]>([]);

  useEffect(() => {
    if (visible) {
      loadFeedTypes();
      setSelectedFeedType(null);
      setWeight("");
      setErrors({});
      setShowFeedSheet(false);
    }
  }, [visible]);

  const loadFeedTypes = async () => {
    const data = await getFeedTypes();
    setFeedTypes(data);
  };

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!selectedFeedType) e.feedType = "Please select a feed type";
    if (!weight.trim() || isNaN(Number(weight)) || Number(weight) <= 0)
      e.weight = "Enter a valid weight";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!selectedFeedType || !batch) {
      return;
    }
    const success = await addFeedEntry(
      selectedFeedType.id,
      parseFloat(weight),
      batch?.id,
    );

    if (success) {
      handleClose();
      showToast("success", "Feed Entry added successfully");
    }
  };

  function handleClose() {
    setSelectedFeedType(null);
    setWeight("");
    setErrors({});
    setShowFeedSheet(false);
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

          <View style={s.sheetHeader}>
            <View style={s.headerLeft}>
              <View>
                <Text style={s.headerTitle}>Add Feed Entry</Text>
                <Text style={s.headerSub}>Record feed added to this batch</Text>
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
                  <Text style={s.contextChipLabel}>FARM</Text>
                  <Text style={s.contextChipValue} numberOfLines={1}>
                    {batch?.farm.name}
                  </Text>
                </View>
              </View>

              <View style={s.contextDivider} />

              <View style={s.contextChip}>
                <View style={[s.contextChipIcon]}>
                  <Ionicons
                    name="layers-outline"
                    size={14}
                    color={Colors.WHITE}
                  />
                </View>
                <View>
                  <Text style={s.contextChipLabel}>BATCH</Text>
                  <Text style={s.contextChipValue} numberOfLines={1}>
                    {batch?.name}
                  </Text>
                </View>
              </View>
            </View>

            <View style={s.formCard}>
              <TouchableOpacity
                style={s.fieldRow}
                onPress={() => setShowFeedSheet(true)}
                activeOpacity={0.7}
              >
                <View style={[s.fieldIcon, s.fieldIconGreen]}>
                  <Ionicons name="leaf-outline" size={16} color={Colors.G700} />
                </View>
                <View style={s.fieldBody}>
                  <Text style={s.fieldLabel}>Feed type</Text>
                  <Text
                    style={selectedFeedType ? s.fieldValue : s.fieldPlaceholder}
                  >
                    {selectedFeedType
                      ? selectedFeedType.name
                      : "Select feed type"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.SLATE500}
                />
              </TouchableOpacity>
              {!!errors.feedType && (
                <Text style={s.errorText}>{errors.feedType}</Text>
              )}

              <View style={[s.fieldRow, s.fieldRowBorder]}>
                <View style={[s.fieldIcon, s.fieldIconGreen]}>
                  <Ionicons
                    name="scale-outline"
                    size={16}
                    color={Colors.G700}
                  />
                </View>
                <View style={s.fieldBody}>
                  <Text style={s.fieldLabel}>Weight (kg)</Text>
                  <TextInput
                    style={s.fieldInput}
                    value={weight}
                    onChangeText={(t) => {
                      setWeight(t);
                      if (errors.weight)
                        setErrors((e) => ({ ...e, weight: "" }));
                    }}
                    placeholder="e.g. 420.5"
                    placeholderTextColor={Colors.SLATE200}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                </View>
                {weight.length > 0 && (
                  <View style={s.kgBadge}>
                    <Text style={s.kgBadgeText}>kg</Text>
                  </View>
                )}
              </View>
              {!!errors.weight && (
                <Text style={s.errorText}>{errors.weight}</Text>
              )}
            </View>

            {selectedFeedType &&
              weight &&
              !isNaN(Number(weight)) &&
              Number(weight) > 0 && (
                <View style={s.summaryBox}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={Colors.G600}
                  />
                  <Text style={s.summaryText}>
                    Adding{" "}
                    <Text style={s.summaryBold}>
                      {Number(weight).toFixed(1)} kg
                    </Text>{" "}
                    of{" "}
                    <Text style={s.summaryBold}>{selectedFeedType.name}</Text>
                  </Text>
                </View>
              )}

            <TouchableOpacity
              style={s.submitBtn}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={s.submitText}>Add Feed Entry</Text>
            </TouchableOpacity>

            <View style={{ height: 8 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showFeedSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFeedSheet(false)}
      >
        <Pressable style={s.backdrop} onPress={() => setShowFeedSheet(false)} />
        <View style={s.feedSheet}>
          <View style={s.dragHandle} />
          <View style={s.feedSheetHeader}>
            <Text style={s.feedSheetTitle}>Select feed type</Text>
            <TouchableOpacity
              onPress={() => setShowFeedSheet(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={Colors.SLATE500} />
            </TouchableOpacity>
          </View>

          {feedTypes.map((feed, idx) => {
            const isSelected = selectedFeedType?.id === feed.id;
            return (
              <TouchableOpacity
                key={feed.id}
                style={[
                  s.feedRow,
                  idx === 0 && s.feedRowFirst,
                  isSelected && s.feedRowSelected,
                ]}
                onPress={() => {
                  setSelectedFeedType(feed);
                  setErrors((e) => ({ ...e, feedType: "" }));
                  setShowFeedSheet(false);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[s.feedRowIcon, isSelected && s.feedRowIconSelected]}
                >
                  <Ionicons
                    name="leaf"
                    size={14}
                    color={isSelected ? Colors.WHITE : Colors.G600}
                  />
                </View>
                <Text
                  style={[s.feedRowText, isSelected && s.feedRowTextSelected]}
                >
                  {feed.name}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={18} color={Colors.G700} />
                )}
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 32 }} />
        </View>
      </Modal>
    </Modal>
  );
}

const s = StyleSheet.create({
  kav: {
    flex: 1,
    justifyContent: "flex-end",
  },
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
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    overflow: "hidden",
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: Colors.SLATE900,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  contextChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  contextChipIcon: {
    backgroundColor: Colors.G700,
    width: 32,
    height: 32,
    borderRadius: 10,
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
    backgroundColor: Colors.SLATE200,
    marginVertical: 10,
  },

  formCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
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
  fieldRowError: {
    backgroundColor: Colors.RED50,
  },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fieldIconGreen: {
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G100,
  },
  fieldBody: {
    flex: 1,
    gap: 3,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.SLATE500,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  fieldInput: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.SLATE900,
    padding: 0,
    margin: 0,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.SLATE900,
  },
  fieldPlaceholder: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.SLATE200,
  },

  kgBadge: {
    backgroundColor: Colors.G100,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.G200,
  },
  kgBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.G700,
    letterSpacing: 0.5,
  },

  errorText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.RED600,
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginTop: -4,
  },

  summaryBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G100,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 12,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.G900,
    flex: 1,
  },
  summaryBold: {
    fontWeight: "800",
    color: Colors.G700,
  },

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
  submitText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: 0.1,
  },

  feedSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: Colors.SLATE900,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: { elevation: 16 },
    }),
  },
  feedSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.SLATE100,
  },
  feedSheetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.3,
  },
  feedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.SLATE100,
  },
  feedRowFirst: {
    borderTopWidth: 0,
  },
  feedRowSelected: {
    backgroundColor: Colors.G50,
  },
  feedRowIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },
  feedRowIconSelected: {
    backgroundColor: Colors.G700,
  },
  feedRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.SLATE700,
  },
  feedRowTextSelected: {
    fontWeight: "800",
    color: Colors.G700,
  },
});
