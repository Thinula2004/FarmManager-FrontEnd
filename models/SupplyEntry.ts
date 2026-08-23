import { SupplyCategory } from "../enums/SupplyType";
import { SupplyUnit } from "../enums/SupplyUnits";
import Model from "./Model";

export default class SupplyEntry extends Model {
  name: string;
  quantity: number;
  unit: SupplyUnit;
  type: SupplyCategory;

  constructor(json?: any) {
    super(json);

    this.name = json?.name ?? "";
    this.quantity = json?.quantity ?? 0;
    this.unit = json?.unit ?? SupplyCategory.Other;
    this.type = json?.type.name.toUpperCase() ?? SupplyUnit.KG;
    
  }

  static fromJson(json: any): SupplyEntry {
    return new SupplyEntry(json);
  }
}
