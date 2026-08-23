import Model from "./Model";

export default class Breed extends Model {
  name: string;

  constructor(json?: any) {
    super(json);

    this.name = json?.name ?? "";
  }

  static fromJson(json: any): Breed {
    return new Breed(json);
  }
}
