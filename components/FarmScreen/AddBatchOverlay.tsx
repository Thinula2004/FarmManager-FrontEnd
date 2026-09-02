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
  StatusBar,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../services/ColorPalette";
import Breed from "../../models/Breed";
import { getAllBreeds } from "../../controllers/animalController";
import { addBatch } from "../../controllers/batchController";
import { showToast } from "../../services/Util";
import DatePicker from "../Common/DatePicker";
import FarmDetailed from "../../models/FarmDetailed";
import Loader from "../Common/Loader";

type Props = {
  visible: boolean;
  farm: FarmDetailed;
  onClose: () => void;
};

// ────────────────────────────────────────────────────────────
export default function AddBatchOverlay({ visible, farm, onClose }: Props) {
  const today = new Date();

  const [batchName, setBatchName] = useState("");
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null);
  const [subBreed, setSubBreed] = useState("");
  const [count, setCount] = useState("");
  const [inDate, setInDate] = useState(today);
  const [showBreedSheet, setShowBreedSheet] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBreeds();
  }, [visible]);

  const loadBreeds = async () => {
    const data = await getAllBreeds();
    setBreeds(data);
  };

  function formatDate(d: Date): string {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!batchName.trim()) e.batchName = "Batch name is required";
    if (!selectedBreed) e.breed = "Please select a breed";
    if (!count || isNaN(Number(count)) || Number(count) <= 0)
      e.count = "Enter a valid chick count";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!selectedBreed) {
      return;
    }

    setLoading(true);

    const success = await addBatch(
      batchName,
      farm.id,
      inDate.toISOString().split("T")[0],
      Number(count),
      selectedBreed?.id,
      subBreed.trim(),
    );

    setLoading(false);

    if (success) {
      showToast("success", "Batch Added Successfully");
      handleClose();
    }
  };

  function handleClose() {
    setBatchName("");
    setSelectedBreed(null);
    setSubBreed("");
    setCount("");
    setInDate(today);
    setErrors({});
    setShowBreedSheet(false);
    setDatePickerVisible(false);
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
                <Text style={s.headerTitle}>Add New Batch</Text>
                <Text style={s.headerSub}>Fill in the details below</Text>
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
            <View style={s.farmChip}>
              <View style={s.farmChipIcon}>
                <Ionicons
                  name="storefront-outline"
                  size={16}
                  color={Colors.WHITE}
                />
              </View>
              <View>
                <Text style={s.farmChipLabel}>ADDING TO FARM</Text>
                <Text style={s.farmChipName}>{farm.name}</Text>
              </View>
            </View>

            <View style={s.formCard}>
              <View style={[s.fieldRow, !!errors.batchName && s.fieldRowError]}>
                <View style={[s.fieldIcon, s.fieldIconGreen]}>
                  <Ionicons
                    name="pricetag-outline"
                    size={16}
                    color={Colors.G700}
                  />
                </View>
                <View style={s.fieldBody}>
                  <Text style={s.fieldLabel}>Batch name</Text>
                  <TextInput
                    style={s.fieldInput}
                    value={batchName}
                    onChangeText={(t) => {
                      setBatchName(t);
                      if (errors.batchName)
                        setErrors((e) => ({ ...e, batchName: "" }));
                    }}
                    placeholder="e.g. Batch #8"
                    placeholderTextColor={Colors.SLATE200}
                    returnKeyType="next"
                  />
                </View>
              </View>
              {!!errors.batchName && (
                <Text style={s.errorText}>{errors.batchName}</Text>
              )}

              <TouchableOpacity
                style={[
                  s.fieldRow,
                  s.fieldRowBorder,
                  !!errors.breed && s.fieldRowError,
                ]}
                onPress={() => setShowBreedSheet(true)}
                activeOpacity={0.7}
              >
                <View style={[s.fieldIcon, s.fieldIconGreen]}>
                  <Ionicons name="paw-outline" size={16} color={Colors.G700} />
                </View>
                <View style={s.fieldBody}>
                  <Text style={s.fieldLabel}>Breed</Text>
                  <Text
                    style={selectedBreed ? s.fieldValue : s.fieldPlaceholder}
                  >
                    {selectedBreed ? selectedBreed.name : "Select a breed"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.SLATE500}
                />
              </TouchableOpacity>
              {!!errors.breed && (
                <Text style={s.errorText}>{errors.breed}</Text>
              )}

              <View style={[s.fieldRow, s.fieldRowBorder]}>
                <View style={[s.fieldIcon, s.fieldIconSlate]}>
                  <Ionicons
                    name="git-branch-outline"
                    size={16}
                    color={Colors.SLATE500}
                  />
                </View>
                <View style={s.fieldBody}>
                  <View style={s.fieldLabelRow}>
                    <Text style={s.fieldLabel}>Sub breed</Text>
                    <Text style={s.optionalTag}> optional</Text>
                  </View>
                  <TextInput
                    style={s.fieldInput}
                    value={subBreed}
                    onChangeText={setSubBreed}
                    placeholder="e.g. Broiler A-Grade"
                    placeholderTextColor={Colors.SLATE200}
                    returnKeyType="next"
                  />
                </View>
              </View>
            </View>

            <View style={[s.formCard, { marginTop: 12 }]}>
              <View style={[s.fieldRow, !!errors.count && s.fieldRowError]}>
                <View style={[s.fieldIcon, s.fieldIconGreen]}>
                  <Ionicons name="egg-outline" size={16} color={Colors.G700} />
                </View>
                <View style={s.fieldBody}>
                  <Text style={s.fieldLabel}>Number of chicks</Text>
                  <TextInput
                    style={s.fieldInput}
                    value={count}
                    onChangeText={(t) => {
                      setCount(t);
                      if (errors.count) setErrors((e) => ({ ...e, count: "" }));
                    }}
                    placeholder="e.g. 5000"
                    placeholderTextColor={Colors.SLATE200}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                </View>
              </View>
              {!!errors.count && (
                <Text style={s.errorText}>{errors.count}</Text>
              )}

              <TouchableOpacity
                style={[s.fieldRow, s.fieldRowBorder]}
                onPress={() => setDatePickerVisible(true)}
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
                  <Text style={s.fieldLabel}>Batch start date</Text>
                  <Text style={s.fieldValue}>{formatDate(inDate)}</Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.SLATE500}
                />
              </TouchableOpacity>
            </View>

            <View style={s.submitBtn}>
              <Loader
                visible={loading}
                background={Colors.G700}
                foreground={Colors.WHITE}
              />
              <TouchableOpacity
                onPress={() => {
                  handleSubmit();
                }}
                activeOpacity={0.85}
              >
                <Text style={s.submitText}>Add Batch</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 8 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showBreedSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBreedSheet(false)}
      >
        <Pressable
          style={s.backdrop}
          onPress={() => setShowBreedSheet(false)}
        />
        <View style={s.breedSheet}>
          <View style={s.dragHandle} />
          <View style={s.breedSheetHeader}>
            <Text style={s.breedSheetTitle}>Select breed</Text>
            <TouchableOpacity onPress={() => setShowBreedSheet(false)}>
              <Ionicons name="close" size={20} color={Colors.SLATE500} />
            </TouchableOpacity>
          </View>
          {breeds.map((breed, idx) => (
            <TouchableOpacity
              key={breed.id}
              style={[
                s.breedRow,
                idx === 0 && s.breedRowFirst,
                selectedBreed?.id === breed.id && s.breedRowSelected,
              ]}
              onPress={() => {
                setSelectedBreed(breed);
                setErrors((e) => ({ ...e, breed: "" }));
                setShowBreedSheet(false);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  s.breedRowText,
                  selectedBreed?.id === breed.id && s.breedRowTextSelected,
                ]}
              >
                {breed.name}
              </Text>
              {selectedBreed?.id === breed.id && (
                <Ionicons name="checkmark" size={18} color={Colors.G700} />
              )}
            </TouchableOpacity>
          ))}
          <View style={{ height: 24 }} />
        </View>
      </Modal>
      {datePickerVisible && (
        <DatePicker
          date={inDate}
          setDate={setInDate}
          onClose={() => setDatePickerVisible(false)}
        />
      )}
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  kav: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.5)",
  },

  // ── Sheet ──────────────────────────────────────────────────
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

  // ── Sheet header ───────────────────────────────────────────
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
  headerIconBox: {
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

  // ── Farm chip ──────────────────────────────────────────────
  farmChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.G100,
    borderWidth: 1,
    borderColor: Colors.G200,
    borderRadius: 16,
    padding: 10,
    marginBottom: 14,
  },
  farmChipIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.G700,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  farmChipLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.G700,
    letterSpacing: 1,
  },
  farmChipName: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.G900,
    letterSpacing: -0.2,
    marginTop: 1,
  },

  // ── Form card ──────────────────────────────────────────────
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

  // ── Field row ──────────────────────────────────────────────
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
    backgroundColor: "#fff8f8",
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
  fieldIconSlate: {
    backgroundColor: Colors.SLATE100,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
  },
  fieldBody: {
    flex: 1,
    gap: 3,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.SLATE500,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  optionalTag: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors.SLATE200,
    textTransform: "none",
    letterSpacing: 0,
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

  // ── Validation error ───────────────────────────────────────
  errorText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#dc2626",
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginTop: -4,
  },

  // ── Inline date picker ─────────────────────────────────────
  inlineDatePicker: {
    borderTopWidth: 1,
    borderTopColor: Colors.SLATE100,
    paddingBottom: 8,
    alignItems: "center",
  },
  dateConfirmBtn: {
    backgroundColor: Colors.G100,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 9,
    marginTop: 4,
  },
  dateConfirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.G700,
  },

  // ── Submit ─────────────────────────────────────────────────
  submitBtn: {
    overflow: "hidden",
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

  // ── Breed picker sheet ─────────────────────────────────────
  breedSheet: {
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
  breedSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.SLATE100,
  },
  breedSheetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.3,
  },
  breedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.SLATE100,
  },
  breedRowFirst: {
    borderTopWidth: 0,
  },
  breedRowSelected: {
    backgroundColor: Colors.G50,
  },
  breedRowText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.SLATE700,
  },
  breedRowTextSelected: {
    fontWeight: "800",
    color: Colors.G700,
  },
});
