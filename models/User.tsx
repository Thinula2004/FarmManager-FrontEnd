import Modal from "./Model";

export default class User extends Modal {
  name: string;
  phone: string;
  role: "owner" | "officer";

  constructor(json?: any) {
    super(json);

    this.name = json?.name ?? "";
    this.phone = json?.phone ?? "";
    this.role = json?.role ?? "officer";
  }

  static fromJson(json: any): User {
    return new User(json);
  }
}
