import DashboardSummery from "../models/DashboardSummery";
import OfficerHomeSummery from "../models/OfficerHomeSummery";
import { apiCall } from "../services/APIController";

export async function getDashboardSummery(): Promise<DashboardSummery | null> {
  const response = await apiCall("GET", "/farms/stats", undefined, true);

  if (!response) {
    return null;
  }

  const data = response.data;

  const summery = DashboardSummery.fromJson(data.stats);

  return summery;
}

export async function getOfficerHomeSummery(
  officerId: string,
): Promise<OfficerHomeSummery | null> {
  const response = await apiCall(
    "GET",
    "/farms/officer/stats/" + officerId,
    undefined,
    true,
  );

  if (!response) {
    return null;
  }

  const data = response.data;

  const summery = OfficerHomeSummery.fromJson(data.stats);

  return summery;
}
