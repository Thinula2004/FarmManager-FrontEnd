import { ChartPoint } from "../components/Common/Chart";
import { apiCall } from "../services/APIController";

export async function getAvgWeightData(batchId: string): Promise<ChartPoint[]> {
  const response = await apiCall(
    "GET",
    "/chart/weight/" + batchId,
    undefined,
    true,
  );

  if (!response) {
    return [];
  }

  const data = response.data.data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    date: new Date(item.date),
    value: Number(item.value),
  }));
}

export async function getMortalityData(batchId: string): Promise<ChartPoint[]> {
  const response = await apiCall(
    "GET",
    "/chart/mortality/" + batchId,
    undefined,
    true,
  );

  if (!response) {
    return [];
  }

  const data = response.data.data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    date: new Date(item.date),
    value: Number(item.value),
  }));
}

export async function getFeedData(batchId: string): Promise<ChartPoint[]> {
  const response = await apiCall(
    "GET",
    "/chart/feed/" + batchId,
    undefined,
    true,
  );

  if (!response) {
    return [];
  }

  const data = response.data.data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    date: new Date(item.date),
    value: Number(item.value),
  }));
}
