import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";

import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import FarmScreen from "../screens/FarmScreen";
import HomeScreen from "../screens/HomeScreen";
import OfficersScreen from "../screens/OfficersScreen";
import FarmsScreen from "../screens/FarmsScreen";
import FarmDetailed from "../models/FarmDetailed";
import SplashScreen from "../screens/SplashScreen";
import BatchScreen from "../screens/BatchScreen";
import BatchMetricsScreen from "../screens/BatchMetricsScreen";
import Batch from "../models/Batch";

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Officers: undefined;
  Farms: undefined;
  Batch: { batchId: string };
  BatchMetrics: { batch: Batch };
  Farm: { farm: FarmDetailed };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateFromStack(
  page: keyof RootStackParamList,
  params?: any,
  reset: boolean = false,
) {
  if (!navigationRef.isReady()) {
    return;
  }

  if (reset) {
    navigationRef.reset({
      index: 0,
      routes: [
        {
          name: page as any,
          params,
        },
      ],
    });

    return;
  }

  (navigationRef as any).navigate(page, params);
}

export default function Navigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Splash"
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
          component={HomeScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Farm"
          component={FarmScreen}
          options={{
            title: "Farm Details",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Officers"
          component={OfficersScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Farms"
          component={FarmsScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Batch"
          component={BatchScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="BatchMetrics"
          component={BatchMetricsScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
