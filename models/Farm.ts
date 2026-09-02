import Model from "./Model";

export default class Farm extends Model {
  name: string;
  city: string;
  address: string;
  customer: string;
  isOpen: boolean;
  tel: string;

  constructor(json?: any) {
    super(json);

    this.name = json?.name ?? "";
    this.city = json?.city ?? "";
    this.address = json?.address ?? "";
    this.customer = json?.customer ?? "";
    this.isOpen = json?.isOpen ?? false;
    this.tel = json?.tel ?? "";
  }

  static fromJson(json: any): Farm {
    return new Farm(json);
  }
}
