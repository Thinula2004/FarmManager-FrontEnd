import DashboardSummery from "../models/DashboardSummery";
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
