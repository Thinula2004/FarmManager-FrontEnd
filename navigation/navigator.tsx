import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { NavigationContainer } from "@react-navigation/native";
import OwnerHomeScreen from "../screens/OwnerHomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import Farm from "../models/Farm";
import FarmPage from "../screens/FarmPage";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Farm: { farm: Farm };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: "#f9fffb",
          },
          headerTitleStyle: {
            fontSize: 20,
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              style={{
                backgroundColor: "transparent",
                paddingLeft: 5,
              }}
            >
              <Ionicons name="settings-outline" size={25} />
            </TouchableOpacity>
          ),
        })}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={OwnerHomeScreen}
          options={{ title: "Dashboard", headerShown: false }}
        />
        <Stack.Screen
          name="Farm"
          component={FarmPage}
          options={{ title: "Farm Details", headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
