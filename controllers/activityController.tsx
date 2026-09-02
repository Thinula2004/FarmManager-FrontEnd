import Activity from "../models/Activity";
import { apiCall } from "../services/APIController";

export async function getActivities(): Promise<Activity[]> {
  const response = await apiCall("GET", "/activity", undefined, true);

  if (!response) {
    return [];
  }

  const data = response.data;
  const activities = data.data.map((activity: any) =>
    Activity.fromJson(activity),
  );

  return activities;
}
