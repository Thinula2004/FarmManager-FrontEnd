import Constants from "expo-constants";
import Toast from "react-native-toast-message";

export const eclipseText = (text: string, length: number): string => {
  if (text.length <= length) {
    return text;
  }

  return `${text.substring(0, length)}...`;
};

type ToastType = "success" | "error" | "info";

export const showToast = (type: ToastType, message: string) => {
  Toast.show({
    type,
    text1: message,
    position: "top",
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 60,
  });
};

export const getVersion = () => {
  const version = Constants.expoConfig?.version;

  return "V " + version;
};

export function getTimeSince(dateString: string | undefined): string {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "1 day ago";
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  const weeks = Math.floor(diffDays / 7);

  if (weeks === 1) {
    return "1 week ago";
  }

  if (weeks < 4) {
    return `${weeks} weeks ago`;
  }

  const months = Math.floor(diffDays / 30);

  if (months === 1) {
    return "1 month ago";
  }

  return `${months} months ago`;
}

export function getDaysSince(dateString: string | undefined): number {
  if (!dateString) {
    return 0;
  }

  const date = new Date(dateString);
  const now = new Date();

  const diff = now.getTime() - date.getTime();

  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function stringToDate(dateString: string): Date {
  return new Date(dateString);
}

export function formatDate(date: Date, char: string = " "): string {
  return `${date.getFullYear()}${char}${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}${char}${String(date.getDate()).padStart(2, "0")}`;
}
