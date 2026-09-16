import Model from "./Model";

export default class Chillout extends Model {
  date: string;
  count: number;
  price: number;
  weight: number;
  customer: string;
  isFinal: boolean;

  constructor(json?: any) {
    super(json);

    this.date = json?.date ?? "";
    this.count = json?.count ?? 0;
    this.price = json?.price ?? 0;
    this.weight = json?.weight ?? 0;
    this.isFinal = json?.isFinal ?? false;
    this.customer = json?.customer ?? "";
  }

  static fromJson(json: any): Chillout {
    return new Chillout(json);
  }
}
