import Visit from "../models/Visit";
import { apiCall } from "../services/APIController";

export async function getVisitsFromBatch(batchId: string): Promise<Visit[]> {
  const response = await apiCall("GET", "/visit/" + batchId, undefined, true);

  if (!response) {
    return [];
  }

  const data = response.data;

  const visits = data.visits
    .map((visit: any) => Visit.fromJson(visit))
    .sort(
      (a: Visit, b: Visit) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return visits;
}
