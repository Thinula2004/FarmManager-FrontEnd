import Model from "./Model";

export default class FeedType extends Model {
  name: string;

  constructor(json?: any) {
    super(json);

    this.name = json?.name ?? "";
    
  }

  static fromJson(json: any): FeedType {
    return new FeedType(json);
  }
}
