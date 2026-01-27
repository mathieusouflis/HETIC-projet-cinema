import { and, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "../../../../database";
import {
  type CreatePeopleProps,
  People,
  type UpdatePeopleProps,
} from "../../domain/entities/people.entity";
import { peopleSchema } from "../schemas/people.schema";

export class PeoplesDrizzleRepository {
  /**
   * Create a person in the database
   */
  async create(props: CreatePeopleProps): Promise<People> {
    const result = await db.insert(peopleSchema).values(props).returning();

    if (!result || result.length === 0) {
      throw new Error("Person not created");
    }

    const createdPerson = result[0];

    if (!createdPerson) {
      throw new Error("Unexpected error: Created person is undefined");
    }

    return new People(createdPerson);
  }

  /**
   * Get person by ID
   */
  async getById(id: string): Promise<People | null> {
    const result = await db.query.people.findFirst({
      where: eq(peopleSchema.id, id),
    });

    if (!result) {
      return null;
    }

    return new People(result);
  }

  /**
   * Get person by TMDB ID
   */
  async getByTmdbId(tmdbId: number): Promise<People | null> {
    const result = await db.query.people.findFirst({
      where: eq(peopleSchema.tmdbId, tmdbId),
    });

    if (!result) {
      return null;
    }

    return new People(result);
  }

  /**
   * List people with optional filters
   */
  async list(params: {
    nationality?: string;
    name?: string;
    tmdbIds?: number[];
    limit?: number;
    offset?: number;
  }): Promise<People[]> {
    const conditions: SQL[] = [];

    if (params.nationality) {
      conditions.push(
        ilike(peopleSchema.nationality, `%${params.nationality}%`)
      );
    }

    if (params.name) {
      conditions.push(ilike(peopleSchema.name, `%${params.name}%`));
    }

    if (params.tmdbIds && params.tmdbIds.length > 0) {
      conditions.push(
        or(...params.tmdbIds.map((id) => eq(peopleSchema.tmdbId, id)))!
      );
    }

    const query = db.select().from(peopleSchema);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    if (params.limit) {
      query.limit(params.limit);
    }

    if (params.offset) {
      query.offset(params.offset);
    }

    const result = await query;

    return result.map((row) => new People(row));
  }

  /**
   * Check which people exist in the database by TMDB IDs
   */
  async checkExistsByTmdbIds<Id extends number>(
    tmdbIds: Id[]
  ): Promise<Record<Id, boolean>> {
    const result = await this.list({ tmdbIds });

    const peopleStatusInDatabase: Record<Id, boolean> = tmdbIds.reduce(
      (acc, id) => {
        acc[id] = result.some((person) => person.tmdbId === id);
        return acc;
      },
      {} as Record<Id, boolean>
    );

    return peopleStatusInDatabase;
  }

  /**
   * Update person in the database
   */
  async update(id: string, props: UpdatePeopleProps): Promise<People> {
    const result = await db
      .update(peopleSchema)
      .set({
        ...props,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(peopleSchema.id, id))
      .returning();

    if (!result || result.length === 0) {
      throw new Error("Person not found or not updated");
    }

    const updatedPerson = result[0];

    if (!updatedPerson) {
      throw new Error("Unexpected error: Updated person is undefined");
    }

    return new People(updatedPerson);
  }

  /**
   * Delete person from the database
   */
  async delete(id: string): Promise<void> {
    await db.delete(peopleSchema).where(eq(peopleSchema.id, id));
  }

  /**
   * Get total count of people
   */
  async getCount(params?: {
    nationality?: string;
    name?: string;
  }): Promise<number> {
    const conditions: SQL[] = [];

    if (params?.nationality) {
      conditions.push(
        ilike(peopleSchema.nationality, `%${params.nationality}%`)
      );
    }

    if (params?.name) {
      conditions.push(ilike(peopleSchema.name, `%${params.name}%`));
    }

    const query = db.select().from(peopleSchema);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const result = await query;
    return result.length;
  }

  /**
   * Bulk create people in the database
   */
  async bulkCreate(peopleList: CreatePeopleProps[]): Promise<People[]> {
    if (peopleList.length === 0) {
      return [];
    }

    const result = await db.insert(peopleSchema).values(peopleList).returning();

    return result.map((row) => new People(row));
  }

  /**
   * Get people by multiple IDs
   */
  async getByIds(ids: string[]): Promise<People[]> {
    if (ids.length === 0) {
      return [];
    }

    const result = await db
      .select()
      .from(peopleSchema)
      .where(or(...ids.map((id) => eq(peopleSchema.id, id)))!);

    return result.map((row) => new People(row));
  }
}
