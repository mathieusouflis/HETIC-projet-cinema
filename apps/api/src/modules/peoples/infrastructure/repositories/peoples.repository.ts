import { logger } from "@packages/logger";
import type {
  CreatePeopleProps,
  People,
  UpdatePeopleProps,
} from "../../domain/entities/people.entity";
import type { IPeoplesRepository } from "../../domain/interfaces/IPeoplesRepository";
import { PeoplesDrizzleRepository } from "./peoples.drizzle.repository";
import {
  type CreatePersonFromTMDB,
  PeoplesTMDBRepository,
} from "./peoples.tmdb.repository";

export class PeoplesRepository implements IPeoplesRepository {
  private readonly drizzleAdapter: PeoplesDrizzleRepository;
  private readonly tmdbAdapter: PeoplesTMDBRepository;

  constructor() {
    this.drizzleAdapter = new PeoplesDrizzleRepository();
    this.tmdbAdapter = new PeoplesTMDBRepository();
  }

  /**
   * Process TMDB people and create them in database if they don't exist
   */
  private async processTMDBPeople(
    tmdbPeople: CreatePersonFromTMDB[]
  ): Promise<People[]> {
    const tmdbIds = tmdbPeople
      .map((item) => item.tmdbId)
      .filter((id) => id !== null && id !== undefined) as number[];

    if (tmdbIds.length === 0) {
      return [];
    }

    const existingPeopleStatus =
      await this.drizzleAdapter.checkExistsByTmdbIds(tmdbIds);
    const peopleToCreate = tmdbPeople.filter(
      (item) => item.tmdbId && !existingPeopleStatus[item.tmdbId]
    );

    if (peopleToCreate.length === 0) {
      return (await this.drizzleAdapter.list({ tmdbIds })).data;
    }

    const created = await this.drizzleAdapter.bulkCreate(peopleToCreate);
    const existing = await this.drizzleAdapter.list({
      tmdbIds: tmdbIds.filter((id) => existingPeopleStatus[id]),
    });

    return [...created, ...existing.data];
  }

  /**
   * Create a person
   */
  async create(peopleContent: CreatePeopleProps): Promise<People> {
    return await this.drizzleAdapter.create(peopleContent);
  }

  /**
   * Get person by ID
   */
  async getById(id: string): Promise<People | null> {
    return await this.drizzleAdapter.getById(id);
  }

  /**
   * List people with filters
   */
  async list(props: {
    nationality?: string;
    name?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    data: People[];
    total: number;
  }> {
    return await this.drizzleAdapter.list(props);
  }

  /**
   * Update a person
   */
  async update(id: string, peopleContent: UpdatePeopleProps): Promise<People> {
    return await this.drizzleAdapter.update(id, peopleContent);
  }

  /**
   * Delete a person
   */
  async delete(id: string): Promise<void> {
    await this.drizzleAdapter.delete(id);
  }

  /**
   * Search people on TMDB and sync to database
   */
  async searchPeople(query: string, page = 1): Promise<People[]> {
    const tmdbPeople = await this.tmdbAdapter.searchPeople(query, page);
    return await this.processTMDBPeople(tmdbPeople);
  }

  /**
   * Get person by TMDB ID (from database or fetch from TMDB)
   */
  async getByTmdbId(tmdbId: number): Promise<People | null> {
    try {
      const existingPerson = await this.drizzleAdapter.getByTmdbId(tmdbId);

      if (existingPerson) {
        return existingPerson;
      }

      const tmdbPerson = await this.tmdbAdapter.getPersonById(tmdbId);

      if (!tmdbPerson) {
        return null;
      }

      return await this.drizzleAdapter.create(tmdbPerson);
    } catch (error) {
      logger.error(`Error getting person by TMDB ID ${tmdbId}: ${error}`);
      return null;
    }
  }

  /**
   * Get people by multiple TMDB IDs
   */
  async getPeopleByTmdbIds(tmdbIds: number[]): Promise<People[]> {
    try {
      const existingPeople = await this.drizzleAdapter.list({ tmdbIds });
      const existingTmdbIds = existingPeople.data
        .map((p) => p.tmdbId)
        .filter((id): id is number => id !== null);

      const missingTmdbIds = tmdbIds.filter(
        (id) => !existingTmdbIds.includes(id)
      );

      if (missingTmdbIds.length === 0) {
        return existingPeople.data;
      }

      // Fetch missing people from TMDB
      const tmdbPeople = await this.tmdbAdapter.getPeopleByIds(missingTmdbIds);
      const newPeople = await this.drizzleAdapter.bulkCreate(tmdbPeople);

      return [...existingPeople.data, ...newPeople];
    } catch (error) {
      logger.error(`Error getting people by TMDB IDs: ${error}`);
      return [];
    }
  }

  /**
   * Get count of people
   */
  async getCount(params?: {
    nationality?: string;
    name?: string;
  }): Promise<number> {
    return await this.drizzleAdapter.getCount(params);
  }
}
