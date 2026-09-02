import User from "../models/User";
import { saveAuth, updateToken } from "../services/AuthService";
import { apiCall } from "../services/APIController";
import { showToast } from "../services/Util";

export async function loginUser(
  phone: string,
  password: string,
): Promise<User> {
  if (!phone || !password) {
    throw new Error("EMPTY_FIELDS");
  }

  const response = await apiCall(
    "POST",
    "/auth/login",
    {
      phone,
      password,
    },
    false,
  );

  if (!response) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const data = response.data;

  const user = User.fromJson(data.user);

  await saveAuth(data.token, user);

  return user;
}

export async function changePassword(password: string): Promise<boolean> {
  if (!password) {
    return false;
  }

  const response = await apiCall(
    "PUT",
    "/auth/change-password",
    {
      password: password,
    },
    true,
  );

  if (!response) {
    return false;
  }

  const data = response.data;

  const token = data.token;

  await updateToken(token);

  return true;
}

export async function activateOfficer(userId: string): Promise<boolean> {
  const response = await apiCall(
    "POST",
    "/user/activate/" + userId,
    undefined,
    true,
  );

  if (!response) {
    return false;
  }

  return true;
}

export async function deactivateOfficer(userId: string): Promise<boolean> {
  const response = await apiCall(
    "POST",
    "/user/deactivate/" + userId,
    undefined,
    true,
  );

  if (!response) {
    return false;
  }

  return true;
}
