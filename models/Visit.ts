import Batch from "./Batch";
import Farm from "./Farm";
import FeedEntry from "./FeedEntry";
import Model from "./Model";
import User from "./User";

export default class Visit extends Model {
  visitNumber: number;
  visitedDate: string;
  batch: Batch;
  feedEntry: FeedEntry;
  remainingFeed: number;
  mortality: number;
  avgWeight: number;
  FCR: number;
  officer: User;
  note: string

  constructor(json?: any) {
    super(json);

    this.visitNumber = json?.visitNumber ?? 0;
    this.visitedDate = json?.visitedDate ?? "";
    this.remainingFeed = json?.remainingFeed ?? 0;
    this.mortality = json?.mortality ?? 0;
    this.avgWeight = json?.avgWeight ?? 0;
    this.FCR = json?.FCR ?? 0;
    this.note = json?.note ?? "";

    this.batch = json?.batch 
        ? Batch.fromJson(json.batch) 
        : new Batch();

    this.feedEntry = json?.feedEntry
        ? FeedEntry.fromJson(json.feedEntry)
        : new FeedEntry();
    
    this.officer = json?.officer
        ? User.fromJson(json.officer)
        : new User();
  }

  static fromJson(json: any): Visit {
    return new Visit(json);
  }
}
