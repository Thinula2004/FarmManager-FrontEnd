import { SupplyType } from "../enums/SupplyType";
import { SupplyUnit } from "../enums/SupplyUnits";
import Model from "./Model";

export default class SupplyEntry extends Model {
  name: string;
  quantity: number;
  unit: SupplyUnit;
  type: SupplyType;

  constructor(json?: any) {
    super(json);

    this.name = json?.name ?? "";
    this.quantity = json?.quantity ?? 0;
    this.unit = json?.unit ?? SupplyType.Medicine;
    this.type = json?.type.name ?? SupplyUnit.KG;
    
  }

  static fromJson(json: any): SupplyEntry {
    return new SupplyEntry(json);
  }
}
