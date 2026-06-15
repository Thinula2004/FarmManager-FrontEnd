import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../navigation/navigator";
import { useNavigation } from "@react-navigation/native";
import { logout } from "../services/AuthService";

export default function SettingsScreen() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;
  const navigation = useNavigation<NavigationProp>();

  const Logout = (): void => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" as never }],
    });
  };

  return (
    <View
      style={{
        backgroundColor: "#F0FDF4",
        flex: 1,
        justifyContent: "flex-start",
        paddingTop: 50,
        alignItems: "center",
      }}
    >
      <TouchableOpacity
        style={{
          borderRadius: 10,
          backgroundColor: "red",
          width: "30%",
          padding: 15,
          alignItems: "center",
        }}
        onPress={() => {
          Logout();
        }}
      >
        <Text style={{ color: "white", fontSize: 17, fontWeight: "600" }}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}
