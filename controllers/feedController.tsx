import FeedEntry from "../models/FeedEntry";
import FeedType from "../models/FeedType";
import { apiCall } from "../services/APIController";

export async function getFeedEntriesFromBatch(
  batchId: string,
): Promise<FeedEntry[]> {
  const response = await apiCall(
    "GET",
    "/feed/entry/" + batchId,
    undefined,
    true,
  );

  if (!response) {
    return [];
  }

  const data = response.data;

  const feedEntries = data.feedEntries
    .map((feedEntry: any) => FeedEntry.fromJson(feedEntry))
    .sort(
      (a: FeedEntry, b: FeedEntry) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return feedEntries;
}

export async function deleteFeedEntry(entryId: string): Promise<boolean> {
  const response = await apiCall(
    "DELETE",
    "/feed/entry/" + entryId,
    undefined,
    true,
  );

  if (!response) {
    return false;
  }

  return true;
}

export async function getFeedTypes(): Promise<FeedType[]> {
  const response = await apiCall("GET", "/feed/type/", undefined, false);

  if (!response) {
    return [];
  }

  const data = response.data;

  const feedTypes = data.feedTypes.map((feedType: any) =>
    FeedType.fromJson(feedType),
  );

  return feedTypes;
}

export async function addFeedEntry(
  feedType: string,
  weight: number,
  batch: string,
  cost: number = 0,
): Promise<boolean> {
  const body = {
    feedType: feedType,
    weight: weight,
    batch: batch,
    cost: cost,
  };
  const response = await apiCall("POST", "/feed/entry/add", body, true);

  if (!response) {
    return false;
  }

  return true;
}
