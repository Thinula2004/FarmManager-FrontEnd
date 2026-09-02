import Model from "./Model";
import User from "./User";

export default class Activity extends Model {
  user: User;
  action: string;
  entity: string;
  reference: string;

  constructor(json?: any) {
    super(json);

    this.user = json?.user ? User.fromJson(json.user) : new User();
    this.action = json?.action ?? "";
    this.entity = json?.entity ?? "";
    this.reference = json?.entityId ?? "";
  }

  static fromJson(json: any): Activity {
    return new Activity(json);
  }
}
