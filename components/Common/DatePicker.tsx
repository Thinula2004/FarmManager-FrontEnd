import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../services/ColorPalette";

type Props = {
  date: Date;
  setDate: (d: Date) => void;
  onClose: () => void;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatSelected(d: Date): string {
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

function buildCalendarDays(year: number, month: number): Date[] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const total = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  const cells: Date[] = [];

  for (let i = 0; i < total; i++) {
    if (i < firstDow) {
      cells.push(new Date(year, month - 1, daysInPrev - firstDow + i + 1));
    } else if (i >= firstDow + daysInMonth) {
      cells.push(new Date(year, month + 1, i - firstDow - daysInMonth + 1));
    } else {
      cells.push(new Date(year, month, i - firstDow + 1));
    }
  }
  return cells;
}

function prevMonth(year: number, month: number): [number, number] {
  return month === 0 ? [year - 1, 11] : [year, month - 1];
}

function nextMonth(year: number, month: number): [number, number] {
  return month === 11 ? [year + 1, 0] : [year, month + 1];
}

// ── Component ───────────────────────────────────────────────
import { useState } from "react";

export default function DatePicker({ date, setDate, onClose }: Props) {
  const today = new Date();

  // Internal staging state — only committed on Confirm
  const [staged, setStaged] = useState<Date>(date);
  const [viewYear, setViewYear] = useState(date.getFullYear());
  const [viewMonth, setViewMonth] = useState(date.getMonth());

  const cells = buildCalendarDays(viewYear, viewMonth);
  const currentMonthStart = new Date(viewYear, viewMonth, 1);

  function handlePrev() {
    const [y, m] = prevMonth(viewYear, viewMonth);
    setViewYear(y);
    setViewMonth(m);
  }

  function handleNext() {
    const [y, m] = nextMonth(viewYear, viewMonth);
    setViewYear(y);
    setViewMonth(m);
  }

  function handleDayPress(d: Date) {
    setStaged(new Date(d));
  }

  function handleConfirm() {
    setDate(staged);
    onClose();
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={s.backdrop} onPress={onClose} />

      {/* Picker card — centered */}
      <View style={s.center} pointerEvents="box-none">
        <View style={s.card}>
          {/* ── Month navigation ── */}
          <View style={s.monthNav}>
            <TouchableOpacity
              style={s.navBtn}
              onPress={handlePrev}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={18} color={Colors.G700} />
            </TouchableOpacity>

            <Text style={s.monthLabel}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>

            <TouchableOpacity
              style={s.navBtn}
              onPress={handleNext}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-forward" size={18} color={Colors.G700} />
            </TouchableOpacity>
          </View>

          {/* ── Weekday labels ── */}
          <View style={s.weekdaysRow}>
            {WEEKDAYS.map((wd) => (
              <Text key={wd} style={s.weekdayLabel}>
                {wd}
              </Text>
            ))}
          </View>

          {/* ── Day grid ── */}
          <View style={s.daysGrid}>
            {cells.map((cell, idx) => {
              const isCurrentMonth =
                cell.getMonth() === viewMonth &&
                cell.getFullYear() === viewYear;
              const isToday = isSameDay(cell, today);
              const isSelected = isSameDay(cell, staged);

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    s.dayCell,
                    isSelected && s.dayCellSelected,
                    !isSelected && isToday && s.dayCellToday,
                  ]}
                  onPress={() => handleDayPress(cell)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      s.dayText,
                      !isCurrentMonth && s.dayTextOther,
                      isToday && !isSelected && s.dayTextToday,
                      isSelected && s.dayTextSelected,
                    ]}
                  >
                    {cell.getDate()}
                  </Text>
                  {/* Today dot */}
                  {isToday && !isSelected && <View style={s.todayDot} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Selected date display ── */}
          <View style={s.selectedStrip}>
            <View style={s.selectedIconWrap}>
              <Ionicons name="calendar-outline" size={16} color={Colors.G700} />
            </View>
            <View>
              <Text style={s.selectedLabel}>SELECTED DATE</Text>
              <Text style={s.selectedValue}>{formatSelected(staged)}</Text>
            </View>
          </View>

          {/* ── Actions ── */}
          <View style={s.actions}>
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.confirmBtn}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Text style={s.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────
const CELL_SIZE = 40;

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  // ── Card ──────────────────────────────────────────────────
  card: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 28,
      },
      android: { elevation: 20 },
    }),
  },

  // ── Month nav ─────────────────────────────────────────────
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.3,
  },

  // ── Weekdays ──────────────────────────────────────────────
  weekdaysRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: Colors.SLATE500,
    letterSpacing: 0.4,
  },

  // ── Days grid ─────────────────────────────────────────────
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
  },
  dayCell: {
    width: `${100 / 7}%` as any,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    position: "relative",
  },
  dayCellSelected: {
    backgroundColor: Colors.G700,
  },
  dayCellToday: {
    backgroundColor: Colors.G50,
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.SLATE700,
  },
  dayTextOther: {
    color: Colors.SLATE200,
  },
  dayTextToday: {
    color: Colors.G700,
    fontWeight: "800",
  },
  dayTextSelected: {
    color: Colors.WHITE,
    fontWeight: "800",
  },
  todayDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.G500,
  },

  // ── Selected strip ────────────────────────────────────────
  selectedStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.G50,
    borderTopWidth: 1,
    borderTopColor: Colors.G100,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.G700,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  selectedValue: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.G900,
    letterSpacing: -0.2,
  },

  // ── Actions ───────────────────────────────────────────────
  actions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 13,
    backgroundColor: Colors.SLATE100,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.SLATE500,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 13,
    backgroundColor: Colors.G700,
    alignItems: "center",
    justifyContent: "center",
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
  confirmText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: 0.1,
  },
});
