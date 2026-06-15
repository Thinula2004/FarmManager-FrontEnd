import User from "./User";

export default class Farm {
  constructor(
    public id: string,
    public name: string,
    public tel: string,
    public city: string,
    public address: string,
    public activeChicks: number,
    public mortalityRate: number,
    public avgWeight: number,
    public lastVisit: string,
    public healthStatus: "Good" | "Fair" | "Poor",
    public batchAge: number,
    public assignedTo: User | null = null,
    public feedConsumed: number = 0,
  ) {}
}
