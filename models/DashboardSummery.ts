import Model from "./Model";

export default class DashboardSummery extends Model {
  liveChicks: number;
  farmCount: number;
  totalMortality: number;
  officerCount: number;

  constructor(json?: any) {
    super(json);

    this.liveChicks = json?.liveChicks ?? "";
    this.farmCount = json?.farmCount ?? "";
    this.totalMortality = json?.totalMortality ?? "";
    this.officerCount = json?.officerCount ?? "";
  }

  static fromJson(json: any): DashboardSummery {
    return new DashboardSummery(json);
  }
}
