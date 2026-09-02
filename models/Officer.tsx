import Farm from "./Farm";
import Model from "./Model";

export default class Officer extends Model {
  name: string;
  phone: string;
  password: string;
  isActive: boolean;
  farms: Farm[];

  constructor(json?: any) {
    super(json);

    this.name = json?.name ?? "";
    this.phone = json?.phone ?? "";
    this.isActive = json?.isActive ?? false;
    this.password = json?.password ?? "";

    this.farms = Array.isArray(json?.farms)
      ? json.farms.map((farm: any) => Farm.fromJson(farm))
      : [];
  }

  static fromJson(json: any): Officer {
    return new Officer(json);
  }
}
