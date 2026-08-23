import Modal from "./Model";

export default class User extends Modal {
  name: string;
  phone: string;
  role: "owner" | "officer";

  constructor(json?: any) {
    super();

    this.name = "";
    this.phone = "";
    this.role = "officer";

    if (json) {
      this.fromJson(json);
    }
  }

  static fromJson(json: any): User {
    const user = new User();

    user.fromJson(json);

    return user;
  }
}
