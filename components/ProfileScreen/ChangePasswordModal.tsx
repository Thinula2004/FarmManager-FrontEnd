import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../services/ColorPalette";
import { changePassword } from "../../controllers/userController";
import { showToast } from "../../services/Util";
import Loader from "../Common/Loader";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ visible, onClose }: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setPassword("");
      setConfirmPassword("");
      setError("");
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [visible]);

  const onUpdate = async () => {
    setError("");

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Both fields are required.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const success = await changePassword(password);

    setLoading(false);

    if (success) {
      showToast("success", "Password updated successfully");
      onClose();
    }
  };

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          style={s.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={s.sheet}>
          <View style={s.handle} />

          <View style={s.header}>
            <View style={s.headerIcon}>
              <Ionicons name="lock-closed" size={20} color={Colors.G700} />
            </View>

            <View style={s.headerText}>
              <Text style={s.title}>Change Password</Text>
              <Text style={s.subtitle}>
                Choose a strong password to keep your account secure
              </Text>
            </View>

            <TouchableOpacity
              style={s.closeBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={18} color={Colors.SLATE500} />
            </TouchableOpacity>
          </View>

          <View style={s.divider} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.scrollContent}
          >
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>New Password</Text>
              <View
                style={[
                  s.inputRow,
                  showPassword && s.inputRowFocused,
                  mismatch && password.length > 0 && s.inputRowError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={Colors.SLATE500}
                  style={s.inputIcon}
                />
                <View style={s.inputInner}>
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: "500",
                      color: Colors.SLATE900,
                    }}
                    value={password} // or confirmPassword
                    onChangeText={(v) => {
                      setPassword(v);
                      setError("");
                    }}
                    placeholder="Enter new password"
                    placeholderTextColor={Colors.SLATE500}
                    secureTextEntry={!showPassword} // or !showConfirm
                  />
                </View>
                <TouchableOpacity
                  style={s.eyeBtn}
                  onPress={() => setShowPassword((p) => !p)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color={Colors.SLATE500}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>Confirm Password</Text>
              <View
                style={[
                  s.inputRow,
                  passwordsMatch && s.inputRowSuccess,
                  mismatch && s.inputRowError,
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color={
                    passwordsMatch
                      ? Colors.G600
                      : mismatch
                        ? Colors.RED500
                        : Colors.SLATE500
                  }
                  style={s.inputIcon}
                />
                <View style={s.inputInner}>
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: "500",
                      color: Colors.SLATE900,
                    }}
                    value={confirmPassword}
                    onChangeText={(v) => {
                      setConfirmPassword(v);
                      setError("");
                    }}
                    placeholder="Re-enter new password"
                    placeholderTextColor={Colors.SLATE500}
                    secureTextEntry={!showConfirm}
                  />
                </View>
                <TouchableOpacity
                  style={s.eyeBtn}
                  onPress={() => setShowConfirm((p) => !p)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirm ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color={Colors.SLATE500}
                  />
                </TouchableOpacity>
              </View>

              {confirmPassword.length > 0 && (
                <View style={s.matchRow}>
                  <Ionicons
                    name={passwordsMatch ? "checkmark-circle" : "close-circle"}
                    size={14}
                    color={passwordsMatch ? Colors.G600 : Colors.RED500}
                  />
                  <Text
                    style={[
                      s.matchText,
                      { color: passwordsMatch ? Colors.G600 : Colors.RED500 },
                    ]}
                  >
                    {passwordsMatch
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </Text>
                </View>
              )}
            </View>

            {error !== "" && (
              <View style={s.errorBanner}>
                <View style={s.errorIconWrap}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={Colors.RED600}
                  />
                </View>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <View style={s.actions}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <View style={s.updateBtn}>
                <Loader
                  visible={loading}
                  background={Colors.G700}
                  foreground={Colors.WHITE}
                />
                <TouchableOpacity
                  style={{ flexDirection: "row", gap: 8 }}
                  onPress={onUpdate}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color={Colors.WHITE}
                  />
                  <Text style={s.updateText}>Update Password</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  sheet: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.13,
        shadowRadius: 18,
      },
      android: { elevation: 24 },
    }),
  },

  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.SLATE200,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 22,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.SLATE500,
    fontWeight: "500",
    lineHeight: 17,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.SLATE100,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.SLATE200,
    marginBottom: 22,
  },

  scrollContent: {
    paddingBottom: 8,
  },

  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.SLATE500,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.SLATE100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.SLATE200,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 4 : 2,
    minHeight: 52,
  },
  inputRowFocused: {
    borderColor: Colors.G600,
    backgroundColor: Colors.G50,
  },
  inputRowSuccess: {
    borderColor: Colors.G500,
    backgroundColor: Colors.G50,
  },
  inputRowError: {
    borderColor: Colors.RED500,
    backgroundColor: Colors.RED50,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputInner: {
    flex: 1,
  },
  eyeBtn: {
    padding: 6,
    marginLeft: 4,
  },

  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    marginLeft: 2,
  },
  matchText: {
    fontSize: 12,
    fontWeight: "600",
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.RED50,
    borderWidth: 1,
    borderColor: Colors.RED100,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 16,
  },
  errorIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.RED100,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.RED800,
    lineHeight: 18,
  },

  hintBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: Colors.G50,
    borderWidth: 1,
    borderColor: Colors.G100,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 22,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    color: Colors.G700,
    fontWeight: "500",
    lineHeight: 17,
  },

  actions: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: Colors.SLATE100,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.SLATE500,
  },
  updateBtn: {
    overflow: "hidden",
    flex: 2,
    flexDirection: "row",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.G700,
    ...Platform.select({
      ios: {
        shadowColor: Colors.G900,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  updateText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: 0.2,
  },
});
