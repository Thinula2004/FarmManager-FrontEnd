import Breed from "./Breed";
import Farm from "./Farm";
import Model from "./Model";

export default class FeedEntry extends Model {
  feedType: string;
  weight: number;

  constructor(json?: any) {
    super(json);

    this.feedType = json?.feedType.name ?? "";
    this.weight = json?.weight ?? 0;
    
  }

  static fromJson(json: any): FeedEntry {
    return new FeedEntry(json);
  }
}
