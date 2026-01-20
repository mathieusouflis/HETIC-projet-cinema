
import { eq, or } from "drizzle-orm";
import { db } from "../../../../../database";
import { content as contentTable } from "../../../../../database/schema";
import { Content, CreateContentProps } from "../../../../contents/domain/entities/content.entity";

export class DrizzleMovieAdapter  {
  async getContentById(_id: string): Promise<Content | null> {
    return null;
  }

  async listMovies(title?: string, tmdbIds?: number[]): Promise<Content[]> {
    const query = db.select().from(contentTable);
    query.where(eq(contentTable.type, "movie"));

    if (title) {
        query.where(eq(contentTable.title, title));
    }

    if (tmdbIds && tmdbIds.length > 0) {
      query.where(or(...tmdbIds.map((id) => eq(contentTable.tmdbId, id))));
    }

    const result = await query

    return result.map((row) => new Content(row));
  }

  async checkMovieExistsInDb<Id extends number>(tmdbIds: Id[]): Promise<Record<Id, boolean>> {
      const result = await this.listMovies(undefined, tmdbIds);

      const moviesStatusInDatabase: Record<Id, boolean> = tmdbIds.reduce((acc, id) => {
          acc[id] = result.some((movie) => movie.tmdbId === id);
          return acc;
      }, {} as Record<Id, boolean>);

      return moviesStatusInDatabase;
  }

  async createMovie(movie: CreateContentProps): Promise<Content> {
    const result = await db.insert(contentTable).values(movie).returning();

    if (!result || result.length === 0) {
      throw new Error('Content not created');
    }

    const createdContent = result[0];

    if (!createdContent) {
      throw new Error('Unexpected error: Created content is undefined');
    }

    return new Content(createdContent);
  }

}
