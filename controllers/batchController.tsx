import Batch from "../models/Batch";
import FeedEntry from "../models/FeedEntry";
import { apiCall } from "../services/APIController";

export async function getAllBatches(farmId: string): Promise<Batch[]> {
  const response = await apiCall(
    "GET",
    "/batch/farm/" + farmId,
    undefined,
    true,
  );

  if (!response) {
    return [];
  }

  const data = response.data;
  const batches = data.batches.map((batch: any) => Batch.fromJson(batch));

  return batches;
}

export async function getBatchByID(batchId: string): Promise<Batch | null> {
  const response = await apiCall("GET", "/batch/" + batchId, undefined, true);

  if (!response) {
    return null;
  }

  const data = response.data;
  const batch = Batch.fromJson(data.batch);

  return batch;
}

export async function deleteBatch(batchId: string): Promise<boolean> {
  const response = await apiCall(
    "DELETE",
    "/batch/" + batchId,
    undefined,
    true,
  );

  if (!response) {
    return false;
  }

  return true;
}

export async function addBatch(
  name: string,
  farmId: string,
  inDate: string,
  initialCount: number,
  breed: string,
  subBreed: string,
  totalCost: number = 0,
): Promise<boolean> {
  const body = {
    name: name,
    farm: farmId,
    inDate: inDate,
    initialCount: initialCount,
    breed: breed,
    subBreed: subBreed,
    totalCost: totalCost,
  };

  const response = await apiCall("POST", "/batch/add", body, true);

  if (!response) {
    return false;
  }

  return true;
}
