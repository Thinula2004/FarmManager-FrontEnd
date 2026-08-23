import Batch from "../models/Batch";
import SupplyEntry from "../models/SupplyEntry";
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
