import Batch from "../models/Batch";
import SupplyEntry from "../models/SupplyEntry";
import SupplyType from "../models/SupplyType";
import { apiCall } from "../services/APIController";

export async function getSupplyEntriesFromBatch(
  batchId: string,
): Promise<SupplyEntry[]> {
  const response = await apiCall("GET", "/supply/" + batchId, undefined, true);

  if (!response) {
    return [];
  }

  const data = response.data;
  const supplyEntries = data.supplies.map((supplyEntry: any) =>
    SupplyEntry.fromJson(supplyEntry),
  );

  return supplyEntries;
}

export async function deleteSupplyEntry(entryId: string): Promise<boolean> {
  const response = await apiCall(
    "DELETE",
    "/supply/" + entryId,
    undefined,
    true,
  );

  if (!response) {
    return false;
  }

  return true;
}

export async function addSupplyEntry(
  name: string,
  type: string,
  quantity: number,
  unit: string,
  batch: string,
): Promise<boolean> {
  const body = {
    name: name,
    type: type,
    quantity: quantity,
    unit: unit,
    batch: batch,
  };
  const response = await apiCall("POST", "/supply/add", body, true);

  if (!response) {
    return false;
  }

  return true;
}

export async function getSupplyTypes(): Promise<SupplyType[]> {
  const response = await apiCall("GET", "/supply/type", undefined, false);

  if (!response) {
    return [];
  }

  const data = response.data;
  const supplyCategories = data.supplyTypes.map((supplyType: any) =>
    SupplyType.fromJson(supplyType),
  );

  return supplyCategories;
}
