import { SupplyCategory } from "../enums/SupplyType";
import Model from "./Model";

export default class SupplyType extends Model {
  name: string;

  constructor(json?: any) {
    super(json);

    this.name = json?.name ?? "";
    
  }

  static fromJson(json: any): SupplyType {
    return new SupplyType(json);
  }

  get category(): SupplyCategory{
    switch(this.name.toUpperCase()){
        case SupplyCategory.Medicine:
            return SupplyCategory.Medicine;
        case SupplyCategory.Vitamin:
            return SupplyCategory.Vitamin;
        case SupplyCategory.Supplement:
            return SupplyCategory.Supplement;
        default:
            return SupplyCategory.Other
    }
  }

}
