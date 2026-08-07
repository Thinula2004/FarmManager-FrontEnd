import { useEffect, useState } from "react";
import { View } from "react-native";
import User from "../models/User";
import { useNavigation } from "@react-navigation/native";
import { getUser, logout } from "../services/AuthService";
import OwnerHomeScreen from "./OwnerHomeScreen";
import OfficerHomeScreen from "./OfficerHomeScreen";
import { RootStackParamList } from "../navigation/navigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  if (user != null) {
    if (user.role == "owner") {
      return <OwnerHomeScreen />;
    } else {
      return <OfficerHomeScreen />;
    }
  }
}
