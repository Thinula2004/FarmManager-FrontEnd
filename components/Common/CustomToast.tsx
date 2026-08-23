import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../services/ColorPalette";

interface Props {
  text1?: string;
}

export const SuccessToast = ({ text1 }: Props) => (
  <View style={[styles.container, styles.success]}>
    <View style={[styles.iconWrap, styles.successIconWrap]}>
      <Ionicons name="checkmark-done-outline" size={18} color={Colors.WHITE} />
    </View>
    <View style={styles.textWrap}>
      <Text style={styles.label}>Success</Text>
      <Text style={[styles.text, styles.successText]} numberOfLines={2}>
        {text1}
      </Text>
    </View>
  </View>
);

export const InfoToast = ({ text1 }: Props) => (
  <View style={[styles.container, styles.info]}>
    <View style={[styles.iconWrap, styles.infoIconWrap]}>
      <Ionicons
        name="information-circle-outline"
        size={18}
        color={Colors.WHITE}
      />
    </View>
    <View style={styles.textWrap}>
      <Text style={[styles.label, styles.infoLabel]}>Info</Text>
      <Text style={[styles.text, styles.infoText]} numberOfLines={2}>
        {text1}
      </Text>
    </View>
  </View>
);

export const ErrorToast = ({ text1 }: Props) => (
  <View style={[styles.container, styles.error]}>
    <View style={[styles.iconWrap, styles.errorIconWrap]}>
      <Ionicons name="close-circle-outline" size={18} color={Colors.WHITE} />
    </View>
    <View style={styles.textWrap}>
      <Text style={[styles.label, styles.errorLabel]}>Error</Text>
      <Text style={[styles.text, styles.errorText]} numberOfLines={2}>
        {text1}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "92%",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 0.5,
    gap: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },

  // ── Left accent bar ──────────────────────────────────
  leftBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.G600,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  infoBar: { backgroundColor: Colors.AMBER500 },
  errorBar: { backgroundColor: Colors.RED500 },

  // ── Icon circle ──────────────────────────────────────
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  successIconWrap: { backgroundColor: Colors.G600 },
  infoIconWrap: { backgroundColor: Colors.AMBER500 },
  errorIconWrap: { backgroundColor: Colors.RED500 },

  // ── Text block ───────────────────────────────────────
  textWrap: { flex: 1 },

  label: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
    color: Colors.G700,
  },
  infoLabel: { color: Colors.AMBER600 },
  errorLabel: { color: Colors.RED600 },

  text: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  successText: { color: Colors.G900 },
  infoText: { color: Colors.AMBER800 },
  errorText: { color: Colors.RED800 },

  // ── Per-variant containers ───────────────────────────
  success: {
    backgroundColor: Colors.G50,
    borderColor: Colors.G700,
    ...Platform.select({
      ios: { shadowColor: Colors.G700 },
    }),
  },
  info: {
    backgroundColor: Colors.AMBER50,
    borderColor: Colors.AMBER600,
    ...Platform.select({
      ios: { shadowColor: Colors.AMBER500 },
    }),
  },
  error: {
    backgroundColor: Colors.RED50,
    borderColor: Colors.RED600,
    ...Platform.select({
      ios: { shadowColor: Colors.RED500 },
    }),
  },
});
