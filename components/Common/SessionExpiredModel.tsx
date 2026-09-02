import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { logout } from "../../services/AuthService";
import { navigateFromStack } from "../../navigation/navigator";
import {
  onSessionExpired,
  resetSessionExpiredNotification,
} from "../../services/APIController";
import Colors from "../../services/ColorPalette";

export default function SessionExpiredModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      setVisible(true);
    });

    return unsubscribe;
  }, []);

  const onContinue = async () => {
    setVisible(false);

    await logout();

    resetSessionExpiredNotification();

    navigateFromStack("Login", undefined, true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={s.backdrop}>
        <View style={s.sheet}>
          {/* Icon */}
          <View style={s.iconWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={28}
              color={Colors.G700}
            />
          </View>

          {/* Text */}
          <Text style={s.title}>Session Expired</Text>

          <Text style={s.body}>
            You've been logged out, please login again.
          </Text>

          {/* Button */}
          <TouchableOpacity
            style={s.btn}
            onPress={onContinue}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  sheet: {
    width: "100%",
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },

      android: {
        elevation: 12,
      },
    }),
  },

  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.G100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.SLATE900,
    letterSpacing: -0.4,
    marginBottom: 8,
  },

  body: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.SLATE500,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },

  btn: {
    width: "100%",
    backgroundColor: Colors.G700,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },

  btnText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: 0.2,
  },
});
