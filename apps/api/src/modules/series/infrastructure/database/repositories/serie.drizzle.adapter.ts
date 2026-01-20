
import { eq, or } from "drizzle-orm";
import { db } from "../../../../../database";
import { content as contentTable } from "../../../../../database/schema";
import { Content, CreateContentProps } from "../../../../contents/domain/entities/content.entity";

export class DrizzleSerieAdapter  {
  async getContentById(_id: string): Promise<Content | null> {
    return null;
  }

  async listSeries(title?: string, tmdbIds?: number[]): Promise<Content[]> {
    const query = db.select().from(contentTable);
    query.where(eq(contentTable.type, "serie"));

    if (title) {
        query.where(eq(contentTable.title, title));
    }

    if (tmdbIds && tmdbIds.length > 0) {
      query.where(or(...tmdbIds.map((id) => eq(contentTable.tmdbId, id))));
    }

    const result = await query

    return result.map((row) => new Content(row));
  }

  async checkSerieExistsInDb<Id extends number>(tmdbIds: Id[]): Promise<Record<Id, boolean>> {
      const result = await this.listSeries(undefined, tmdbIds);

      const seriesStatusInDatabase: Record<Id, boolean> = tmdbIds.reduce((acc, id) => {
          acc[id] = result.some((serie) => serie.tmdbId === id);
          return acc;
      }, {} as Record<Id, boolean>);

      return seriesStatusInDatabase;
  }

  async createSerie(serie: CreateContentProps): Promise<Content> {
    const result = await db.insert(contentTable).values(serie).returning();

    if (!result || result.length === 0) {
      throw new Error('Serie not created');
    }

    const createdContent = result[0];

    if (!createdContent) {
      throw new Error('Unexpected error: Created serie is undefined');
    }

    return new Content(createdContent);
  }

}
