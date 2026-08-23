import { SafeAreaProvider } from "react-native-safe-area-context";
import Navigator from "./navigation/navigator";
import SessionExpiredModal from "./components/Common/SessionExpiredModel";
import {
  ErrorToast,
  InfoToast,
  SuccessToast,
} from "./components/Common/CustomToast";
import Toast from "react-native-toast-message";

export default function App() {
  const toastConfig = {
    success: (props: any) => <SuccessToast {...props} />,

    error: (props: any) => <ErrorToast {...props} />,

    info: (props: any) => <InfoToast {...props} />,
  };
  return (
    <SafeAreaProvider>
      <Navigator />

      <SessionExpiredModal />
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}
