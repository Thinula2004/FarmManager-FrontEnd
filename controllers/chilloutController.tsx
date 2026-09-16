import Chillout from "../models/Chillout";
import { apiCall } from "../services/APIController";

export async function getChilloutsFromBatch(
  batchId: string,
): Promise<Chillout[]> {
  const response = await apiCall(
    "GET",
    "/chillout/" + batchId,
    undefined,
    true,
  );

  if (!response) {
    return [];
  }

  const data = response.data;
  const chillouts = data.chillouts.map((chillout: any) =>
    Chillout.fromJson(chillout),
  );

  return chillouts;
}

export async function addChillout(
  batchId: string,
  date: string,
  count: number,
  customer: string,
  weight: number,
): Promise<boolean> {
  const body = {
    batchId,
    date,
    count,
    customer,
    weight,
  };
  const response = await apiCall("POST", "/chillout/add", body, true);

  if (!response) {
    return false;
  }

  return true;
}

export async function addFinalChillout(
  batchId: string,
  date: string,
  count: number,
  customer: string,
  weight: number,
  feedRemaining: number,
): Promise<boolean> {
  const body = {
    batchId,
    date,
    count,
    customer,
    weight,
    feedRemaining,
  };
  const response = await apiCall("POST", "/chillout/add/last", body, true);

  if (!response) {
    return false;
  }

  return true;
}

export async function deleteChillout(chilloutId: string): Promise<boolean> {
  const response = await apiCall(
    "DELETE",
    "/chillout/" + chilloutId,
    undefined,
    true,
  );

  if (!response) {
    return false;
  }

  return true;
}
