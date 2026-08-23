import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../../services/ColorPalette";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: any;
  icon: string;
}

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  icon,
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
        <Ionicons
          name={icon as any}
          size={16}
          color={focused ? Colors.G700 : Colors.SLATE500}
          style={styles.icon}
        />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.SLATE500}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: 14,
  },

  label: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.SLATE100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.SLATE200,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
  },

  inputRowFocused: {
    borderColor: Colors.G600,
    backgroundColor: Colors.G50,
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.SLATE900,
  },
});
