import Breed from "../models/Breed";
import { apiCall } from "../services/APIController";

export async function getAllBreeds(): Promise<Breed[]> {
  const response = await apiCall("GET", "/animal/breed", undefined, false);

  if (!response) {
    return [];
  }

  const data = response.data;
  const breeds = data.breeds.map((breed: any) => Breed.fromJson(breed));

  return breeds;
}
