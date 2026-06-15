export default class User {
  constructor(
    public id: string,
    public name: string,
    public phone: string,
    public role: "owner" | "officer",
  ) {}
}
