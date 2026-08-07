import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/navigator";
import { logout, getUser } from "../services/AuthService";
import User from "../models/User";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../services/ColorPalette";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  danger?: boolean;
};

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const roleLabel = user?.role === "owner" ? "Farm Owner" : "Field Officer";

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          logout();
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" as never }],
          });
        },
      },
    ]);
  };

  const menuSections: { label: string; items: MenuItem[] }[] = [
    {
      label: "Preferences",
      items: [
        {
          icon: "notifications-outline",
          iconBg: Colors.SLATE100,
          title: "Notifications",
          subtitle: "Manage alerts and reminders",
        },
        {
          icon: "lock-closed-outline",
          iconBg: Colors.SLATE100,
          title: "Change Password",
          subtitle: "Update your credentials",
        },
        {
          icon: "help-circle-outline",
          iconBg: Colors.SLATE100,
          title: "Help & Support",
          subtitle: "FAQs and contact",
        },
      ],
    },
  ];

  if (user?.role == "owner") {
    menuSections.splice(0, 0, {
      label: "Farm Management",
      items: [
        {
          icon: "storefront-outline",
          iconBg: Colors.G50,
          title: "My Farms",
          subtitle: "View and manage your farms",
        },
        {
          icon: "bar-chart-outline",
          iconBg: Colors.G50,
          title: "Activity Log",
          subtitle: "Recent visits and changes",
        },
      ],
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.G700} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero header ── */}
        <View style={styles.hero}>
          <View style={styles.ring1} />
          <View style={styles.ring2} />
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backChevron}>
              <Ionicons name="chevron-back" size={18} color={Colors.WHITE} />
            </View>
            <Text style={styles.backLabel}>Profile</Text>
          </TouchableOpacity>

          {/* Avatar + name */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>

            <Text style={styles.heroName}>{user?.name ?? "Loading..."}</Text>

            <View style={styles.roleBadge}>
              <View style={styles.roleDot} />
              <Text style={styles.roleText}>{roleLabel}</Text>
            </View>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>
          {/* Account info card */}
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>Account Info</Text>
          </View>
          <View style={styles.card}>
            <InfoRow
              icon="person-outline"
              iconBg={Colors.G50}
              label="Full name"
              value={user?.name ?? "—"}
            />
            <InfoRow
              icon="call-outline"
              iconBg={Colors.G50}
              label="Phone number"
              value={user?.phone ?? "—"}
            />
            <InfoRow
              icon="shield-checkmark-outline"
              iconBg={Colors.G50}
              label="Role"
              value={roleLabel}
              last
            />
          </View>

          {/* Menu sections */}
          {menuSections.map((section) => (
            <View key={section.label}>
              <View style={styles.sectionLabel}>
                <Text style={styles.sectionLabelText}>{section.label}</Text>
              </View>
              <View style={styles.card}>
                {section.items.map((item, idx) => (
                  <MenuRow
                    key={item.title}
                    {...item}
                    last={idx === section.items.length - 1}
                  />
                ))}
              </View>
            </View>
          ))}

          {/* Logout button */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.75}
          >
            <View style={styles.logoutIconWrap}>
              <Ionicons name="log-out-outline" size={25} color={Colors.WHITE} />
            </View>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>

          {/* App version */}
          <Text style={styles.version}>FarmManager V1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  iconBg,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && styles.rowBorder]}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={Colors.G700} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

function MenuRow({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
  last = false,
}: MenuItem & { last?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.menuRow, !last && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={Colors.SLATE700} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.SLATE500} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.G50,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // ── Hero ──────────────────────────────────────────────
  hero: {
    backgroundColor: Colors.G700,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 48,
    position: "relative",
    overflow: "hidden",
  },
  ring1: {
    position: "absolute",
    top: -55,
    right: -55,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 28,
    borderColor: "rgba(255,255,255,0.08)",
  },
  ring2: {
    position: "absolute",
    top: -15,
    right: -18,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 16,
    borderColor: "rgba(255,255,255,0.11)",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 28,
    alignSelf: "flex-start",
    zIndex: 2,
  },
  backChevron: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  backLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },
  avatarSection: {
    alignItems: "center",
    zIndex: 2,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 14,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.G700,
    letterSpacing: -1,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.G500,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.2,
  },

  // ── Body ──────────────────────────────────────────────
  body: {
    backgroundColor: Colors.G50,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    marginTop: -24,
    paddingHorizontal: 18,
    paddingTop: 24,
    flex: 1,
    minHeight: 600,
  },

  sectionLabel: {
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.G700,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  // ── Card ──────────────────────────────────────────────
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.SLATE200,
    overflow: "hidden",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: Colors.SLATE900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },

  // ── Shared row ────────────────────────────────────────
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.SLATE100,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },

  // ── Info row ──────────────────────────────────────────
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.SLATE500,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.SLATE900,
    letterSpacing: -0.1,
  },

  // ── Menu row ──────────────────────────────────────────
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.SLATE900,
    marginBottom: 1,
  },
  menuSub: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.SLATE500,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "50%",
    backgroundColor: Colors.RED600,
    borderRadius: 16,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 16,
    marginHorizontal: "auto",
    ...Platform.select({
      ios: {
        shadowColor: Colors.RED600,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  logoutIconWrap: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.WHITE,
    letterSpacing: -0.2,
  },

  version: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.SLATE500,
    fontWeight: "500",
    marginBottom: 8,
  },
});
