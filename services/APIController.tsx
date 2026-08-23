import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getToken } from "./AuthService";
import { showToast } from "./Util";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type SessionExpiredListener = () => void;

const sessionExpiredListeners: SessionExpiredListener[] = [];

export const onSessionExpired = (
  listener: SessionExpiredListener,
): (() => void) => {
  sessionExpiredListeners.push(listener);

  return () => {
    const index = sessionExpiredListeners.indexOf(listener);

    if (index !== -1) {
      sessionExpiredListeners.splice(index, 1);
    }
  };
};

const notifySessionExpired = () => {
  sessionExpiredListeners.forEach((listener) => {
    listener();
  });
};

export const showError = (message: string) => {
  showToast("error", message);
};

export interface ApiResponse<T = any> {
  data: T;
  status: number;
}

export const apiCall = async <T = any,>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  endpoint: string,
  body?: any,
  authorized: boolean = false,
): Promise<ApiResponse<T> | null> => {
  try {
    if (!API_URL) {
      showError("API URL is not configured.");
      return null;
    }

    const config: AxiosRequestConfig = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (authorized) {
      const token = await getToken();

      if (!token) {
        notifySessionExpired();
        return null;
      }

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    if (method === "POST" || method === "PUT") {
      config.data = body;
    }

    console.log(`${method} => ${API_URL + endpoint}`);

    const response = await axios.request<T>(config);

    console.log(`${method} => ${API_URL + endpoint} => ${response.status}`);

    if (response.status !== 200 && response.status !== 201) {
      const message =
        response.data &&
        typeof response.data === "object" &&
        "message" in response.data
          ? (response.data as any).message
          : "An error occurred.";

      showError(message);

      return null;
    }

    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        notifySessionExpired();

        return null;
      }

      const message =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while communicating with the server.";

      showError(message);

      return null;
    }

    console.log("API Error:", error);

    showError("An unexpected error occurred.");

    return null;
  }
};
