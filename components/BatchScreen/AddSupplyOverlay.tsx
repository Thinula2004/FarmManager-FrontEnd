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
import Batch from "../../models/Batch";
import {
  addSupplyEntry,
  getSupplyTypes,
} from "../../controllers/supplyController";
import SupplyType from "../../models/SupplyType";
import { getSupplyIcon } from "../../services/Util";
import Loader from "../Common/Loader";

const UNITS = ["KG", "G", "L", "ML", "Doses"];

type Props = {
  visible: boolean;
  batch: Batch | null;
  onClose: () => void;
};

export default function AddSupplyOverlay({ visible, batch, onClose }: Props) {
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SupplyType | null>(
    null,
  );
  const [quantity, setQuantity] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string | null>("KG");
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showUnitSheet, setShowUnitSheet] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [supplyCategories, setSupplyCategories] = useState<SupplyType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSupplyCategories();
      setName("");
      setSelectedCategory(null);
      setQuantity("");
      setSelectedUnit("KG");
      setErrors({});
      setShowCategorySheet(false);
      setShowUnitSheet(false);
    }
  }, [visible]);

  const loadSupplyCategories = async () => {
    const data = await getSupplyTypes();
    setSupplyCategories(data);
  };

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Supply name is required";
    if (!selectedCategory) e.category = "Please select a category";
    if (
      !quantity.trim() ||
      isNaN(Number(quantity)) ||
      Number(quantity) <= 0 ||
      !selectedUnit
    )
      e.quantity = "Enter a valid quantity and unit";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!selectedCategory || !batch || !selectedUnit) {
      return;
    }

    setLoading(true);

    const success = await addSupplyEntry(
      name,
      selectedCategory?.id,
      parseFloat(quantity),
      selectedUnit,
      batch?.id,
    );

    setLoading(false);

    if (success) {
      handleClose();
    }
  };

  useEffect(() => {
    if (errors.quantity) {
      setErrors((e) => ({ ...e, quantity: "" }));
    }
  }, [selectedUnit]);

  function handleClose() {
    setName("");
    setSelectedCategory(null);
    setQuantity("");
    setSelectedUnit("KG");
    setErrors({});
    setShowCategorySheet(false);
    setShowUnitSheet(false);
    onClose();
  }

  const summaryReady =
    name.trim() &&
    selectedCategory &&
    selectedUnit &&
    quantity &&
    !isNaN(Number(quantity)) &&
    Number(quantity) > 0;

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
                <Text style={s.headerTitle}>Add Supply</Text>
                <Text style={s.headerSub}>
                  Record a supply used in this batch
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
                  <Text style={s.contextChipLabel}>FARM</Text>
                  <Text style={s.contextChipValue} numberOfLines={1}>
                    {batch?.farm.name}
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
                    {batch?.name}
                  </Text>
                </View>
              </View>
            </View>

            <View style={s.formCard}>
              <View style={[s.fieldRow]}>
                <View style={[s.fieldIcon, s.fieldIconGreen]}>
                  <Ionicons name="cube-outline" size={16} color={Colors.G700} />
                </View>
                <View style={s.fieldBody}>
                  <Text style={s.fieldLabel}>Supply name</Text>
                  <TextInput
                    style={s.fieldInput}
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      if (errors.name) setErrors((e) => ({ ...e, name: "" }));
                    }}
                    placeholder="e.g. Newcastle Vaccine"
                    placeholderTextColor={Colors.SLATE200}
                    returnKeyType="next"
                  />
                </View>
              </View>
              {!!errors.name && <Text style={s.errorText}>{errors.name}</Text>}

              <TouchableOpacity
                style={[s.fieldRow, s.fieldRowBorder]}
                onPress={() => setShowCategorySheet(true)}
                activeOpacity={0.7}
              >
                <View style={[s.fieldIcon, s.fieldIconGreen]}>
                  <Ionicons
                    name={
                      selectedCategory
                        ? (getSupplyIcon(selectedCategory.category) as any)
                        : "grid-outline"
                    }
                    size={16}
                    color={Colors.G700}
                  />
                </View>
                <View style={s.fieldBody}>
                  <Text style={s.fieldLabel}>Category</Text>
                  <Text
                    style={selectedCategory ? s.fieldValue : s.fieldPlaceholder}
                  >
                    {selectedCategory
                      ? selectedCategory.name
                      : "Select a category"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.SLATE500}
                />
              </TouchableOpacity>
              {!!errors.category && (
                <Text style={s.errorText}>{errors.category}</Text>
              )}
            </View>

            <View style={[s.formCard, { marginTop: 12 }]}>
              <View style={s.quantityUnitRow}>
                {/* Quantity */}
                <View style={[s.quantityField]}>
                  <View style={[s.fieldIcon, s.fieldIconGreen]}>
                    <Ionicons
                      name="calculator-outline"
                      size={16}
                      color={Colors.G700}
                    />
                  </View>

                  <View style={s.fieldBody}>
                    <Text style={s.fieldLabel}>Quantity</Text>

                    <TextInput
                      style={s.fieldInput}
                      value={quantity}
                      onChangeText={(t) => {
                        setQuantity(t);

                        if (errors.quantity) {
                          setErrors((e) => ({ ...e, quantity: "" }));
                        }
                      }}
                      placeholder="e.g. 25"
                      placeholderTextColor={Colors.SLATE200}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                    />
                  </View>
                </View>

                {/* Unit */}
                <TouchableOpacity
                  style={[s.unitField]}
                  onPress={() => setShowUnitSheet(true)}
                  activeOpacity={0.7}
                >
                  <View style={s.fieldBody}>
                    <Text style={s.fieldLabel}>Unit</Text>

                    <Text
                      style={selectedUnit ? s.fieldValue : s.fieldPlaceholder}
                      numberOfLines={1}
                    >
                      {selectedUnit ?? "Select"}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={Colors.SLATE500}
                  />
                </TouchableOpacity>
              </View>

              {!!errors.quantity && (
                <Text style={s.errorText}>{errors.quantity}</Text>
              )}
            </View>

            {summaryReady && (
              <View style={s.summaryBox}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.G600}
                />
                <Text style={s.summaryText}>
                  Adding{" "}
                  <Text style={s.summaryBold}>
                    {Number(quantity).toFixed(quantity.includes(".") ? 2 : 0)}{" "}
                    {selectedUnit}
                  </Text>{" "}
                  of <Text style={s.summaryBold}>{name.trim()}</Text>
                  {selectedCategory ? (
                    <Text style={s.summarySub}> · {selectedCategory.name}</Text>
                  ) : null}
                </Text>
              </View>
            )}

            <View style={s.submitBtn}>
              <Loader
                visible={loading}
                background={Colors.G700}
                foreground={Colors.WHITE}
              />
              <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85}>
                <Text style={s.submitText}>Add Supply</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 8 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showCategorySheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategorySheet(false)}
      >
        <Pressable
          style={s.backdrop}
          onPress={() => setShowCategorySheet(false)}
        />
        <View style={s.pickerSheet}>
          <View style={s.dragHandle} />
          <View style={s.pickerSheetHeader}>
            <Text style={s.pickerSheetTitle}>Select category</Text>
            <TouchableOpacity
              onPress={() => setShowCategorySheet(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={Colors.SLATE500} />
            </TouchableOpacity>
          </View>

          {supplyCategories.map((cat, idx) => {
            const isSelected = selectedCategory?.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  s.pickerRow,
                  idx === 0 && s.pickerRowFirst,
                  isSelected && s.pickerRowSelected,
                ]}
                onPress={() => {
                  setSelectedCategory(cat);
                  setErrors((e) => ({ ...e, category: "" }));
                  setShowCategorySheet(false);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    s.pickerRowIcon,
                    isSelected && s.pickerRowIconSelected,
                  ]}
                >
                  <Ionicons
                    name={getSupplyIcon(cat.category) as any}
                    size={15}
                    color={isSelected ? Colors.WHITE : Colors.G600}
                  />
                </View>
                <Text
                  style={[
                    s.pickerRowText,
                    isSelected && s.pickerRowTextSelected,
                  ]}
                >
                  {cat.name}
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

      <Modal
        visible={showUnitSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUnitSheet(false)}
      >
        <Pressable style={s.backdrop} onPress={() => setShowUnitSheet(false)} />
        <View style={s.pickerSheet}>
          <View style={s.dragHandle} />
          <View style={s.pickerSheetHeader}>
            <Text style={s.pickerSheetTitle}>Select unit</Text>
            <TouchableOpacity
              onPress={() => setShowUnitSheet(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={Colors.SLATE500} />
            </TouchableOpacity>
          </View>

          {UNITS.map((unit, idx) => {
            const isSelected = selectedUnit === unit;
            return (
              <TouchableOpacity
                key={unit}
                style={[
                  s.pickerRow,
                  idx === 0 && s.pickerRowFirst,
                  isSelected && s.pickerRowSelected,
                ]}
                onPress={() => {
                  setSelectedUnit(unit);
                  setErrors((e) => ({ ...e, unit: "" }));
                  setShowUnitSheet(false);
                }}
                activeOpacity={0.7}
              >
                <View style={[s.unitPill, isSelected && s.unitPillSelected]}>
                  <Text
                    style={[
                      s.unitPillText,
                      isSelected && s.unitPillTextSelected,
                    ]}
                  >
                    {unit}
                  </Text>
                </View>
                <Text
                  style={[
                    s.pickerRowText,
                    isSelected && s.pickerRowTextSelected,
                  ]}
                >
                  {unit === "KG"
                    ? "Kilograms"
                    : unit === "G"
                      ? "Grams"
                      : unit === "L"
                        ? "Litres"
                        : unit === "ML"
                          ? "Millilitres"
                          : "Doses"}
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
  fieldIconSlate: {
    backgroundColor: Colors.SLATE100,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
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

  unitBadge: {
    backgroundColor: Colors.G100,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.G200,
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.G700,
    letterSpacing: 0.5,
  },

  quantityUnitRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  quantityField: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  unitField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderLeftWidth: 1,
    borderLeftColor: Colors.SLATE100,
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
  summarySub: {
    fontWeight: "500",
    color: Colors.SLATE500,
  },

  submitBtn: {
    flexDirection: "row",
    overflow: "hidden",
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

  pickerSheet: {
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
  pickerSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.SLATE100,
  },
  pickerSheetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.3,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.SLATE100,
  },
  pickerRowFirst: {
    borderTopWidth: 0,
  },
  pickerRowSelected: {
    backgroundColor: Colors.G50,
  },
  pickerRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerRowIconSelected: {
    backgroundColor: Colors.G700,
  },
  pickerRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.SLATE700,
  },
  pickerRowTextSelected: {
    fontWeight: "800",
    color: Colors.G700,
  },

  unitPill: {
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.SLATE100,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    alignItems: "center",
  },
  unitPillSelected: {
    backgroundColor: Colors.G700,
    borderColor: Colors.G700,
  },
  unitPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.SLATE500,
    letterSpacing: 0.5,
  },
  unitPillTextSelected: {
    color: Colors.WHITE,
  },
});
