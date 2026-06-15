import User from "../models/User";
import { saveAuth } from "../services/AuthService";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL + "/api/auth";

export async function loginUser(phone: string, password: string) {
  if (!phone || !password) {
    throw new Error("EMPTY_FIELDS");
  }

  const url = `${BASE_URL}/login`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone, password }),
  });

  if (!res.ok) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const data = await res.json();

  const user = new User(
    data.user.id,
    data.user.name,
    data.user.phone,
    data.user.role,
  );

  await saveAuth(data.token, user);

  return user;
}
