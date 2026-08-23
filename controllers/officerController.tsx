import Farm from "../models/Farm";
import Officer from "../models/Officer";
import { apiCall } from "../services/APIController";

export async function getAllOfficers(): Promise<Officer[]> {
  const response = await apiCall("GET", "/user/officers", undefined, true);

  if (!response) {
    return [];
  }

  const data = response.data;

  return data.officers.map((officer: any) => Officer.fromJson(officer));
}

export async function addOfficer(
  name: string,
  phone: string,
  password: string,
  farms: Farm[],
): Promise<boolean> {
  const body = {
    name,
    phone,
    password,
    farmIds: farms.map((farm) => farm.id),
  };

  const response = await apiCall("POST", "/user/add", body, true);

  if (!response) {
    return false;
  }

  return true;
}

export async function updateOfficer(
  id: string,
  name: string,
  phone: string,
  password: string,
  farms: Farm[],
): Promise<boolean> {
  const body: any = {
    name,
    phone,
    farmIds: farms.map((farm) => farm.id),
  };

  if (password.trim()) {
    body.password = password;
  }

  const response = await apiCall("PUT", `/user/${id}`, body, true);

  if (!response) {
    return false;
  }

  return true;
}

export async function deleteOfficer(id: string): Promise<boolean> {
  const response = await apiCall("DELETE", `/user/${id}`, undefined, true);

  if (!response) {
    return false;
  }

  return true;
}
