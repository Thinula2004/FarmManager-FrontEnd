import Constants from "expo-constants";
import Toast from "react-native-toast-message";
import { SupplyCategory } from "../enums/SupplyType";
import { Ionicons } from "@expo/vector-icons";

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

export function formatTime(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}-${date.getFullYear()} ${String(
    date.getHours(),
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function getSupplyIcon(
  category: SupplyCategory,
): keyof typeof Ionicons.glyphMap {
  switch (category) {
    case SupplyCategory.Vitamin:
      return "shield-checkmark-outline";
    case SupplyCategory.Medicine:
      return "medkit-outline";
    case SupplyCategory.Supplement:
      return "flask-outline";
    default:
      return "ellipsis-vertical-circle-outline";
  }
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function formatWeight(
  weight: number | undefined,
  isUnit: boolean = true,
): string {
  if (!weight) {
    if (!isUnit) {
      return "0";
    }
    return "0 G";
  }
  if (weight < 1000) {
    if (isUnit) {
      return `${weight.toFixed(2).replace(/\.00$/, "")} G`;
    } else {
      return `${weight.toFixed(2).replace(/\.00$/, "")}`;
    }
  }

  if (isUnit) {
    return `${(weight / 1000).toFixed(2)} KG`;
  } else {
    return `${(weight / 1000).toFixed(2)}`;
  }
}
