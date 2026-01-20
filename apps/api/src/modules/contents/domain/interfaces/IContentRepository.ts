import { Content } from "../entities/content.entity";

export interface IContentRepository {
  listContents: (type?: string, title?: string) => Promise<Content[]>;
}
