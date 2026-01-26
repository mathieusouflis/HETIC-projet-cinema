import { logger } from "@packages/logger";
import { TmdbService } from "../../../../shared/services/tmdb";
import { TMDBFetchStatusRepository } from "../../../contents/infrastructure/database/repositories/tmdb-fetch-status/tmdb-fetch-status.repository";
import { MetadataNotFoundError } from "../../../contents/infrastructure/database/repositories/tmdb-fetch-status/errors/metadata-not-found";

type TMDBPerson = {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  known_for: Array<{
    adult: boolean;
    backdrop_path: string | null;
    id: number;
    title?: string;
    name?: string;
    original_language: string;
    original_title?: string;
    original_name?: string;
    overview: string;
    poster_path: string | null;
    media_type: string;
    genre_ids: number[];
    popularity: number;
    release_date?: string;
    first_air_date?: string;
    video?: boolean;
    vote_average: number;
    vote_count: number;
  }>;
};

type TMDBPersonDetails = {
  adult: boolean;
  also_known_as: string[];
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  homepage: string | null;
  id: number;
  imdb_id: string;
  known_for_department: string;
  name: string;
  place_of_birth: string | null;
  popularity: number;
  profile_path: string | null;
};

type SearchPeopleResult = {
  page: number;
  results: Array<TMDBPerson>;
  total_pages: number;
  total_results: number;
};

export type CreatePersonFromTMDB = {
  name: string;
  bio: string | null;
  photoUrl: string | null;
  birthDate: string | null;
  nationality: string | null;
  tmdbId: number;
};

/**
 * TMDB People Repository
 * Handles fetching people data from TMDB API with caching support
 */
export class PeoplesTMDBRepository {
  private tmdbService: TmdbService;
  private tmdbFetchStatusRepository: TMDBFetchStatusRepository;
  private readonly TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

  constructor() {
    this.tmdbService = new TmdbService();
    this.tmdbFetchStatusRepository = new TMDBFetchStatusRepository();
  }

  /**
   * Parse TMDB person details to CreatePersonFromTMDB
   */
  private parsePersonDetails(person: TMDBPersonDetails): CreatePersonFromTMDB {
    return {
      name: person.name,
      bio: person.biography || null,
      photoUrl: person.profile_path
        ? `${this.TMDB_IMAGE_BASE_URL}${person.profile_path}`
        : null,
      birthDate: person.birthday || null,
      nationality: person.place_of_birth || null,
      tmdbId: person.id,
    };
  }

  /**
   * Parse basic TMDB person to CreatePersonFromTMDB
   */
  private parseBasicPerson(person: TMDBPerson): CreatePersonFromTMDB {
    return {
      name: person.name,
      bio: null,
      photoUrl: person.profile_path
        ? `${this.TMDB_IMAGE_BASE_URL}${person.profile_path}`
        : null,
      birthDate: null,
      nationality: null,
      tmdbId: person.id,
    };
  }

  /**
   * Get person details by TMDB ID
   */
  async getPersonById(tmdbId: number): Promise<CreatePersonFromTMDB | null> {
    try {
      const endpoint = `person/${tmdbId}`;
      const result = await this.tmdbService.request<TMDBPersonDetails>("GET", endpoint);
      return this.parsePersonDetails(result);
    } catch (error) {
      logger.error(`Error fetching person by TMDB ID ${tmdbId}: ${error}`);
      return null;
    }
  }

  /**
   * Search people on TMDB with cache tracking
   */
  async searchPeople(query: string, page: number = 1): Promise<CreatePersonFromTMDB[]> {
    try {
      const result = await this.tmdbService.request<SearchPeopleResult>("GET", "search/person", {
        query,
        page: page.toString(),
      });

      // Save search metadata to cache
      await this.tmdbFetchStatusRepository.setSearchMetadata(query, { page });

      return result.results.map((person) => this.parseBasicPerson(person));
    } catch (error) {
      logger.error(`Error searching people with query "${query}": ${error}`);
      return [];
    }
  }

  /**
   * Get detailed information for multiple people by their TMDB IDs
   */
  async getPeopleByIds(tmdbIds: number[]): Promise<CreatePersonFromTMDB[]> {
    try {
      const peoplePromises = tmdbIds.map((id) => this.getPersonById(id));
      const people = await Promise.all(peoplePromises);
      return people.filter((person): person is CreatePersonFromTMDB => person !== null);
    } catch (error) {
      logger.error(`Error fetching people by IDs: ${error}`);
      return [];
    }
  }

  /**
   * Check if a search query has been cached
   */
  async hasSearchBeenCached(query: string): Promise<boolean> {
    try {
      await this.tmdbFetchStatusRepository.getSearchMetadata(query);
      return true;
    } catch (error) {
      if (error instanceof MetadataNotFoundError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Clear cache for a specific search query
   */
  async clearSearchCache(query: string): Promise<void> {
    await this.tmdbFetchStatusRepository.deleteSearchMetadata(query);
  }


}
