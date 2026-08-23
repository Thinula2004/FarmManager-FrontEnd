export default abstract class Model {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(json?: any) {
    this.id = json?.id ?? json?._id ?? "";

    this.createdAt = json?.createdAt
      ? new Date(json.createdAt)
      : new Date();

    this.updatedAt = json?.updatedAt
      ? new Date(json.updatedAt)
      : new Date();
  }

  protected fromJson(json: any): void {
    Object.keys(json).forEach((key) => {
      if (key === "id" || key === "_id") {
        this.id = json[key];
      } else if (key === "createdAt") {
        this.createdAt = new Date(json[key]);
      } else if (key === "updatedAt") {
        this.updatedAt = new Date(json[key]);
      } else {
        (this as any)[key] = json[key];
      }
    });
  }
}