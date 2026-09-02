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

export async function getVisitsByOfficer(officerId: string): Promise<Visit[]> {
  const response = await apiCall(
    "GET",
    "/visit/officer/" + officerId,
    undefined,
    true,
  );

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

export async function addVisit(
  batch: string,
  visitedDate: string,
  remainingFeed: number,
  mortality: number,
  avgWeight: number,
  FCR: number,
  note: string | undefined,
): Promise<boolean> {
  const body = {
    batch: batch,
    visitedDate: visitedDate,
    remainingFeed: remainingFeed,
    mortality: mortality,
    avgWeight: avgWeight,
    FCR: FCR,
    note: note ? note : null,
  };
  const response = await apiCall("POST", "/visit/add/", body, true);

  if (!response) {
    return false;
  }

  return true;
}

export async function deleteVisit(visitId: string): Promise<boolean> {
  const response = await apiCall(
    "DELETE",
    "/visit/" + visitId,
    undefined,
    true,
  );

  if (!response) {
    return false;
  }

  return true;
}
