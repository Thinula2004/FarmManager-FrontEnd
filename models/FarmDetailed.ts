import Modal from "./Model";
import Officer from "./Officer";

export default class FarmDetailed extends Modal {
  name: string;
  tel: string;
  city: string;
  address: string;
  customer: string;
  activeStatus: string;
  
  activeBatchCount: number;
  totalBatchCount: number;
  liveChicks: number;
  totalMortality: number;

  lastVisit: string;
  officers: Officer[];


  constructor(json?: any) {
    super(json);  

    this.name = json?.name ?? "";
    this.city = json?.city ?? "";
    this.address = json?.address ?? "";
    this.customer = json?.customer ?? "";
    this.tel = json?.tel ?? "";
    this.activeStatus = json?.activeStatus ?? "";
    
    this.activeBatchCount = json?.activeBatchCount ?? 0;
    this.totalBatchCount = json?.totalBatchCount ?? 0;
    this.liveChicks = json?.liveChicks ?? 0;
    this.totalMortality = json?.totalMortality ?? 0;
    
    this.lastVisit = json?.lastVisit ?? "";

    this.officers = Array.isArray(json?.officers)
          ? json.officers.map((officer: any) => Officer.fromJson(officer))
          : [];
  }

  static fromJson(json: any): FarmDetailed {
    return new FarmDetailed(json);
  }
 
  get status(): "Active" | "Partially Active" | "Inactive"{
    switch (this.activeStatus) {
      case "ACTIVE":
        return "Active";

      case "PARTIALLY_ACTIVE":
        return "Partially Active";

      default:
        return "Inactive";
    }
  }

}

