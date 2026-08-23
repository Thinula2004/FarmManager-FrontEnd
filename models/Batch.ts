import Breed from "./Breed";
import Farm from "./Farm";
import Model from "./Model";

export default class Batch extends Model {
  name: string;
  inDate: string;
  initialCount: number;
  subBreed: string;
  totalCost: number;
  status: string;
  breed: Breed;
  totalMortality: number;
  avgWeight: number;
  fcr: number;
  feedRemaining: number;
  lastVisit: string;
  farm: Farm

  constructor(json?: any) {
    super(json);

    this.name = json?.name ?? "";
    this.inDate = json?.inDate ?? "";
    this.initialCount = json?.initialCount ?? 0;
    this.subBreed = json?.subBreed ?? "";
    this.totalCost = json?.totalCost ?? "";
    this.status = json?.status ?? "";
    this.totalMortality = json?.totalMortality ?? 0;
    this.avgWeight = json?.avgWeight ?? 0;
    this.fcr = json?.fcr ?? 0;
    this.feedRemaining = json?.feedRemaining ?? 0;
    this.lastVisit = json?.lastVisit ?? "";


    this.farm = json?.farm 
        ? Farm.fromJson(json.farm) 
        : new Farm();

    this.breed = json?.breed
        ? Breed.fromJson(json.breed)
        : new Breed();
  }

  static fromJson(json: any): Batch {
    return new Batch(json);
  }

  get getStatus(): "Ongoing" | "Partially Sold" | "Completed"{
    switch (this.status) {
      case "ONGOING":
        return "Ongoing";

      case "PARTIALLY_SOLD":
        return "Partially Sold";

      default:
        return "Completed";
    }
  }

  get liveChicks(): number{
    return this.initialCount - this.totalMortality;
  }

  get mortalityPct(): number {
    const val = (this.totalMortality / this.initialCount) * 100
    return  Math.round(val * 100) / 100;;
  }

  get livePct(): number{
    const val = (this.liveChicks/this.initialCount)* 100
    return  Math.round(val * 100) / 100;
  }
}
