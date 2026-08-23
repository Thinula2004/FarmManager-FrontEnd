import Farm from "../models/Farm";
import FarmDetailed from "../models/FarmDetailed";
import { apiCall } from "../services/APIController";

export async function getAllFarms(): Promise<Farm[]> {
  const response = await apiCall("GET", "/farms/", undefined, true);

  if (!response) {
    throw new Error("FAILED_TO_GET_FARMS");
  }

  const data = response.data;

  return data.farms.map((farm: any) => Farm.fromJson(farm));
}

export async function addFarm(
  name: string,
  city: string,
  address: string,
  customer: string,
  tel: string,
): Promise<Farm | null> {
  const body = {
    name: name,
    city: city,
    address: address,
    customer: customer,
    tel: tel,
  };
  const response = await apiCall("POST", "/farms/add", body, true);

  if (!response) {
    return null;
  }

  const data = response.data;

  return Farm.fromJson(data.farm);
}

export async function updateFarm(
  id: string,
  name: string,
  city: string,
  address: string,
  customer: string,
  tel: string,
): Promise<Farm | null> {
  const body = {
    name: name,
    city: city,
    address: address,
    customer: customer,
    tel: tel,
  };
  const response = await apiCall("PUT", `/farms/${id}`, body, true);

  if (!response) {
    return null;
  }

  const data = response.data;

  return Farm.fromJson(data.farm);
}

export async function deleteFarm(id: string): Promise<boolean> {
  const response = await apiCall("DELETE", `/farms/${id}`, undefined, true);

  if (!response) {
    return false;
  }

  return true;
}

export async function getAllFarmsDetailed(): Promise<FarmDetailed[]> {
  const response = await apiCall("GET", "/farms/details", undefined, true);

  if (!response) {
    return [];
  }

  const data = response.data;

  const farms: FarmDetailed[] = data.farms.map((farm: any) =>
    FarmDetailed.fromJson(farm),
  );

  farms.sort((a: FarmDetailed, b: FarmDetailed) => b.liveChicks - a.liveChicks);

  return farms;
}
