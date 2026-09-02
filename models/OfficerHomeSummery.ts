import Model from "./Model";

export default class OfficerHomeSummery extends Model {
  assignedFarms: number;
  totalVisits: number;
  activeBatches: number;

  constructor(json?: any) {
    super(json);

    this.assignedFarms = json?.assignedFarms ?? 0;
    this.totalVisits = json?.totalVisits ?? 0;
    this.activeBatches = json?.activeBatches ?? 0;
  }

  static fromJson(json: any): OfficerHomeSummery {
    return new OfficerHomeSummery(json);
  }
}
