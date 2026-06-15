import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { loginUser } from "../routes/userRoutes";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { getToken } from "../services/AuthService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/navigator";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;
  const navigation = useNavigation<NavigationProp>();

  useFocusEffect(
    useCallback(() => {
      const checkLogin = async () => {
        const token = await getToken();
        if (token) {
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" as never }],
          });
        }
      };
      checkLogin();
    }, []),
  );

  const handleLogin = async () => {
    setMessage("");
    if (!phone || !password) {
      setMessage("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      await loginUser(phone, password);
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" as never }],
      });
    } catch (err: any) {
      if (err.message === "EMPTY_FIELDS") {
        setMessage("Please fill all fields");
      } else {
        setMessage("Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Logo card */}
          <View style={styles.logoCard}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
          </View>

          {/* Brand name */}
          <Text style={styles.title}>Crest Farm</Text>
          <Text style={styles.subtitle}>Maha Oya</Text>

          {/* Divider */}
          <View style={styles.divider} />

          <Text style={styles.signInLabel}>Sign in to your account</Text>

          {/* Form card */}
          <View style={styles.formCard}>
            {/* Phone input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                placeholder="Enter your phone number"
                placeholderTextColor="#aab4b0"
                value={phone}
                onChangeText={setPhone}
                style={[styles.input, phoneFocused && styles.inputFocused]}
                keyboardType="phone-pad"
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
              />
            </View>

            {/* Password input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#aab4b0"
                value={password}
                onChangeText={setPassword}
                style={[styles.input, passwordFocused && styles.inputFocused]}
                secureTextEntry
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </View>

            {/* Error message */}
            {message !== "" && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {message}</Text>
              </View>
            )}

            {/* Login button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                {loading ? "Signing in..." : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>Crest Farm Management System © 2026</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const GREEN = "#009331";
const GREEN_LIGHT = "#e6f5eb";
const GREEN_MID = "#A5D6A7";
const GREEN_DARK = "#007a28";

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f4faf6",
  },

  scrollViewContent: {
    flexGrow: 1,
  },

  topAccent: {
    height: 6,
    backgroundColor: GREEN,
    width: "100%",
  },

  container: {
    marginTop: "20%",
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },

  logoCard: {
    width: 110,
    height: 110,
    borderRadius: 28,
    // backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 18,
  },

  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: GREEN,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#5a8a6a",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 20,
  },

  divider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: GREEN_MID,
    marginBottom: 20,
  },

  signInLabel: {
    fontSize: 14,
    color: "#6b8f78",
    marginBottom: 24,
    fontWeight: "500",
  },

  formCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 32,
  },

  inputGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4a7a5a",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  input: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#d4ead9",
    backgroundColor: "#f9fdfb",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    fontSize: 15,
    color: "#1a3a28",
  },

  inputFocused: {
    borderColor: GREEN,
    backgroundColor: "#fff",
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },

  errorBox: {
    backgroundColor: "#fff4f4",
    borderWidth: 1,
    borderColor: "#f5c6c6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },

  errorText: {
    color: "#c0392b",
    fontSize: 13,
    fontWeight: "500",
  },

  button: {
    backgroundColor: GREEN,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
    shadowColor: GREEN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  buttonDisabled: {
    backgroundColor: GREEN_MID,
    elevation: 0,
    shadowOpacity: 0,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  footer: {
    fontSize: 11,
    color: "#9ab8a3",
    textAlign: "center",
  },
});
