import { logger } from "@packages/logger";
import { CategoryRepository } from "../../../modules/categories/infrastructure/database/repositories/category/category.repository";
import { EpisodesDatabaseRepository } from "../../../modules/episodes/infrastructure/database/episodes.database.repository";
import type { TMDBEpisode } from "../../../modules/episodes/infrastructure/tmdb/episodes.tmdb.repository";
import type { TMDBPeople } from "../../../modules/movies/infrastructure/database/repositories/tmdb-movies.repository";
import { PeoplesRepository } from "../../../modules/peoples/infrastructure/repositories/peoples.repository";
import { PlatformsRepository } from "../../../modules/platforms/infrastructure/database/platforms.repository";
import { SeasonsDatabaseRepository } from "../../../modules/seasons/infrastructure/database/seasons.database.repository";
import type { TMDBSeason } from "../../../modules/seasons/infrastructure/tmdb/seasons.tmdb.repository";
import type { PagePaginationQuery } from "../../../shared/services/pagination";
import type {
  BaseContentProps,
  BaseDrizzleRepository,
  BaseEntity,
} from "./base-drizzle-repository";
import type { BaseTMDBRepository } from "./base-tmdb-repository";
import {
  CacheManager,
  type ProviderData,
  type TMDBGenre,
  type TMDBRelations,
} from "./composite-repository-types";

const categoryCache = new Map<number, string>();
const providerCache = new Map<number, string>();
const castCache = new Map<number, string>();
const seasonCache = new Map<number, string>();
const episodeCache = new Map<number, string>();

export { CacheManager };

export interface CompositeEntity extends BaseEntity {
  removeRelations(key: string): void;
}

export abstract class BaseCompositeRepository<
  TEntity extends CompositeEntity,
  TProps,
  TCreateProps extends BaseContentProps,
  TTMDBRepository extends BaseTMDBRepository<any, any>,
  TDrizzleRepository extends BaseDrizzleRepository<
    TEntity,
    TProps,
    TCreateProps
  >,
> {
  protected readonly tmdbRepository: TTMDBRepository;
  protected readonly drizzleRepository: TDrizzleRepository;
  protected readonly categoryRepository: CategoryRepository;
  protected readonly platformRepository: PlatformsRepository;
  protected readonly peoplesRepository: PeoplesRepository;
  protected readonly seasonsRepository: SeasonsDatabaseRepository;
  protected readonly episodesRepository: EpisodesDatabaseRepository;
  protected abstract readonly entityType: string;

  constructor(
    tmdbRepository: TTMDBRepository,
    drizzleRepository: TDrizzleRepository
  ) {
    this.tmdbRepository = tmdbRepository;
    this.drizzleRepository = drizzleRepository;
    this.categoryRepository = new CategoryRepository();
    this.platformRepository = new PlatformsRepository();
    this.peoplesRepository = new PeoplesRepository();
    this.seasonsRepository = new SeasonsDatabaseRepository();
    this.episodesRepository = new EpisodesDatabaseRepository();
  }

  protected async baseSearch(
    query: string,
    options?: PagePaginationQuery & {
      withCategories?: boolean;
      withPlatforms?: boolean;
      withCast?: boolean;
      withSeasons?: boolean;
      withEpisodes?: boolean;
    }
  ): Promise<TEntity[]> {
    try {
      const page = options?.page || 1;

      const tmdbResult = await this.tmdbRepository.search({
        query,
        page,
      });

      const tmdbIds = tmdbResult.ids;
      logger.info(
        `Found ${tmdbIds.length} ${this.entityType} from TMDB search for "${query}"`
      );

      if (tmdbIds.length === 0) {
        return [];
      }

      const existingEntities = await this.drizzleRepository.getByTmdbIds(
        tmdbIds,
        {
          withCategories: options?.withCategories,
          withPlatforms: options?.withPlatforms,
          withCast: options?.withCast,
        }
      );
      const existingTmdbIds = existingEntities
        .map((entity) => entity.tmdbId)
        .filter((id): id is number => id !== null && id !== undefined);

      const missingTmdbIds = tmdbIds.filter(
        (id) => !existingTmdbIds.includes(id)
      );

      let newEntities: TEntity[] = [];
      if (missingTmdbIds.length > 0) {
        logger.info(
          `Fetching ${missingTmdbIds.length} missing ${this.entityType} from TMDB`
        );
        const entityDetails =
          await this.tmdbRepository.getMultipleDetails(missingTmdbIds);
        newEntities = await this.createEntitiesWithRelations(entityDetails);
      }

      const allEntities = [...existingEntities, ...newEntities];

      if (!options?.withCategories) {
        allEntities.forEach((entity) => {
          entity.removeRelations("contentCategories");
        });
      }

      if (!options?.withPlatforms) {
        allEntities.forEach((entity) => {
          entity.removeRelations("contentPlatforms");
        });
      }

      if (!options?.withCast) {
        allEntities.forEach((entity) => {
          entity.removeRelations("contentCredits");
        });
      }

      if (!options?.withSeasons) {
        allEntities.forEach((entity) => {
          entity.removeRelations("seasons");
        });
      }

      return allEntities;
    } catch (error) {
      logger.error(`Error searching ${this.entityType}: ${error}`);
      throw error;
    }
  }

  protected async baseList(
    title?: string,
    _country?: string,
    categories?: string[],
    withCategories?: boolean,
    withPlatforms?: boolean,
    withCast?: boolean,
    withSeasons?: boolean,
    withEpisodes?: boolean,
    options?: PagePaginationQuery
  ): Promise<{ data: TEntity[]; total: number }> {
    try {
      const page = options?.page || 1;

      let tmdbResult: { ids: number[]; results: unknown[]; total: number };

      if (title) {
        tmdbResult = await this.tmdbRepository.search({
          query: title,
          page,
          withCategories: categories,
        });
        logger.info(
          `Found ${tmdbResult.ids.length} ${this.entityType} IDs from TMDB search for "${title}"`
        );
      } else {
        tmdbResult = await this.tmdbRepository.discover({
          page,
          withCategories: categories,
        });
        logger.info(
          `Found ${tmdbResult.ids.length} ${this.entityType} IDs from TMDB discover (page ${page})`
        );
      }

      const tmdbIds = tmdbResult.ids;

      if (tmdbIds.length === 0) {
        return { data: [], total: 0 };
      }

      const existingEntities = await this.drizzleRepository.getByTmdbIds(
        tmdbIds,
        {
          withCategories: withCategories,
          withPlatforms: withPlatforms,
          withCast: withCast,
          withSeasons: this.drizzleRepository.contentType && withSeasons,
          withEpisodes: this.drizzleRepository.contentType && withEpisodes,
        }
      );
      logger.info(
        `Found ${existingEntities.length} existing ${this.entityType} in database`
      );

      const existingTmdbIds = existingEntities
        .map((entity) => entity.tmdbId)
        .filter((id): id is number => id !== null && id !== undefined);

      const missingTmdbIds = tmdbIds.filter(
        (id) => !existingTmdbIds.includes(id)
      );

      let newlyCreatedEntities: TEntity[] = [];
      if (missingTmdbIds.length > 0) {
        logger.info(
          `Fetching ${missingTmdbIds.length} missing ${this.entityType} from TMDB`
        );

        const entityDetails =
          await this.tmdbRepository.getMultipleDetails(missingTmdbIds);
        newlyCreatedEntities =
          await this.createEntitiesWithRelations(entityDetails);
      }

      const allEntities = [...existingEntities, ...newlyCreatedEntities];

      const { data, total } = {
        data: allEntities,
        total: await this.drizzleRepository.getCount(),
      };

      if (!withCategories) {
        data.forEach((entity) => {
          entity.removeRelations("contentCategories");
        });
      }

      if (!withPlatforms) {
        data.forEach((entity) => {
          entity.removeRelations("contentPlatforms");
        });
      }

      if (!withCast) {
        data.forEach((entity) => {
          entity.removeRelations("contentCredits");
        });
      }

      if (!withSeasons) {
        data.forEach((entity) => {
          entity.removeRelations("seasons");
        });
      }

      return { data, total };
    } catch (error) {
      logger.error(`Error listing ${this.entityType}: ${error}`);
      throw error;
    }
  }

  private async createEntitiesWithRelations(
    entityProps: Array<TCreateProps & TMDBRelations>
  ): Promise<TEntity[]> {
    const allGenresMap = new Map<number, TMDBGenre>();
    const allProvidersMap = new Map<number, ProviderData>();
    const allCastMap = new Map<number, TMDBPeople>();

    for (const props of entityProps) {
      const { genres, providers, cast } = props;

      if (providers) {
        for (const provider of providers) {
          if (!allProvidersMap.has(provider.provider_id)) {
            allProvidersMap.set(provider.provider_id, provider);
          }
        }
      }

      if (genres) {
        for (const genre of genres) {
          if (!allGenresMap.has(genre.id)) {
            allGenresMap.set(genre.id, genre);
          }
        }
      }

      if (cast) {
        for (const credit of cast) {
          if (!allCastMap.has(credit.id)) {
            allCastMap.set(credit.id, credit);
          }
        }
      }
    }

    const allGenres = Array.from(allGenresMap.values());
    if (allGenres.length > 0) {
      await this.ensureCategoriesExist(allGenres);
    }

    const allProviders = Array.from(allProvidersMap.values());
    if (allProviders.length > 0) {
      await this.ensureProvidersExist(allProviders);
    }

    const allCast = Array.from(allCastMap.values());
    if (allCast.length > 0) {
      await this.ensureCastsExist(allCast);
    }

    for (const entityProp of entityProps) {
      try {
        const { genres, providers, cast, seasons, ...entityData } = entityProp;

        const entity = await this.drizzleRepository.create(
          entityData as TCreateProps
        );

        if (genres && genres.length > 0) {
          const categoryIds: string[] = [];
          for (const genre of genres) {
            const categoryId = categoryCache.get(genre.id);
            if (categoryId) {
              categoryIds.push(categoryId);
            }
          }

          if (categoryIds.length > 0) {
            await this.drizzleRepository.linkCategories(entity.id, categoryIds);
          }
        }

        if (providers && providers.length > 0) {
          const providerIds: string[] = [];
          for (const provider of providers) {
            const providerId = providerCache.get(provider.provider_id);
            if (providerId) {
              providerIds.push(providerId);
            }
          }

          if (providerIds.length > 0) {
            await this.drizzleRepository.linkProviders(entity.id, providerIds);
          }
        }

        if (cast && cast.length > 0) {
          const newCastList: (TMDBPeople & {
            dbId: string;
          })[] = cast
            .map((credit) => {
              const dbId = castCache.get(credit.cast_id);
              if (!dbId) {
                return undefined;
              }

              return {
                ...credit,
                dbId,
              };
            })
            .filter((c) => c !== undefined);

          await this.drizzleRepository.linkCasts(entity.id, newCastList);
        }

        if (seasons && seasons.length > 0) {
          await this.ensureSeasonsExist(seasons, entity.id);
        }
      } catch (error) {
        logger.error(
          `Error creating ${this.entityType} with TMDB ID ${entityProp.tmdbId}: ${error}`
        );
      }
    }

    const allTmdbIds = entityProps
      .map((prop) => prop.tmdbId)
      .filter((el) => el !== undefined && el !== null);

    return await this.drizzleRepository.getByTmdbIds(allTmdbIds, {
      withCast: true,
      withCategories: true,
      withPlatforms: true,
      withEpisodes: true,
      withSeasons: true,
    });
  }

  private async ensureCategoriesExist(genres: Array<TMDBGenre>): Promise<void> {
    const uncachedGenres = genres.filter(
      (genre) => !categoryCache.has(genre.id)
    );

    if (uncachedGenres.length === 0) {
      return;
    }

    const genreIds = uncachedGenres.map((genre) => genre.id);
    const existingCategories =
      await this.categoryRepository.findByTmdbIds(genreIds);

    for (const category of existingCategories) {
      if (category.tmdbId !== null) {
        categoryCache.set(category.tmdbId, category.id);
      }
    }

    const existingTmdbIds = new Set(
      existingCategories
        .map((cat) => cat.tmdbId)
        .filter((id): id is number => id !== null)
    );

    const missingGenres = uncachedGenres.filter(
      (genre) => !existingTmdbIds.has(genre.id)
    );

    if (missingGenres.length === 0) {
      return;
    }

    for (const genre of missingGenres) {
      if (categoryCache.has(genre.id)) {
        continue;
      }

      try {
        const slug = CacheManager.generateSlug(genre.name);

        const existingBySlug = await this.categoryRepository.findBySlug(slug);

        if (existingBySlug) {
          categoryCache.set(genre.id, existingBySlug.id);
          logger.info(`Found existing category by slug: ${genre.name}`);
          continue;
        }

        const newCategory = await this.categoryRepository.create({
          name: genre.name,
          slug,
          tmdbId: genre.id,
        });

        categoryCache.set(genre.id, newCategory.id);
      } catch (error) {
        logger.error(`Error creating category ${genre.name}: ${error}`);
        try {
          const retryFind = await this.categoryRepository.findByTmdbIds([
            genre.id,
          ]);
          if (retryFind.length > 0 && retryFind[0]) {
            categoryCache.set(genre.id, retryFind[0].id);
            logger.info(`Found category ${genre.name} on retry`);
          }
        } catch (retryError) {
          logger.error(`Retry also failed for ${genre.name}: ${retryError}`);
        }
      }
    }
  }

  private async ensureProvidersExist(providers: ProviderData[]): Promise<void> {
    const uncachedProviders = providers.filter(
      (provider) => !providerCache.has(provider.provider_id)
    );

    if (uncachedProviders.length === 0) {
      return;
    }

    const providersId = uncachedProviders.map(
      (provider) => provider.provider_id
    );
    const existingProviders =
      await this.platformRepository.findByTmdbIds(providersId);

    for (const provider of existingProviders) {
      const jsonProvider = provider.toJSON();
      if (jsonProvider.tmdbId !== null) {
        providerCache.set(jsonProvider.tmdbId, jsonProvider.id);
      }
    }

    const existingTmdbIds = new Set(
      existingProviders
        .map((provider) => provider.toJSON().tmdbId)
        .filter((id): id is number => id !== null)
    );

    const missingProviders = uncachedProviders.filter(
      (provider) => !existingTmdbIds.has(provider.provider_id)
    );

    if (missingProviders.length === 0) {
      return;
    }

    for (const provider of missingProviders) {
      if (providerCache.has(provider.provider_id)) {
        continue;
      }

      try {
        const slug = CacheManager.generateSlug(provider.provider_name);

        const newProvider = await this.platformRepository.create({
          name: provider.provider_name,
          slug,
          tmdbId: provider.provider_id,
        });

        providerCache.set(provider.provider_id, newProvider.toJSON().id);
        logger.info(`Created provider: ${provider.provider_name}`);
      } catch (error) {
        logger.error(
          `Error creating provider ${provider.provider_name}: ${error}`
        );
      }
    }
  }

  private async ensureCastsExist(casts: TMDBPeople[]): Promise<void> {
    const uncachedCasts = casts.filter((cast) => !castCache.has(cast.cast_id));

    if (uncachedCasts.length === 0) {
      return;
    }

    const castsId = uncachedCasts.map((cast) => cast.cast_id);
    const existingCasts = await this.peoplesRepository.getByTMDBIds(castsId);

    for (const cast of existingCasts) {
      const jsonCast = cast.toJSON();
      if (jsonCast.tmdbId !== null) {
        castCache.set(jsonCast.tmdbId, jsonCast.id);
      }
    }

    const existingTmdbIds = new Set(
      existingCasts
        .map((cast) => cast.toJSON().tmdbId)
        .filter((id): id is number => id !== null)
    );

    const missingCasts = uncachedCasts.filter(
      (cast) => !existingTmdbIds.has(cast.cast_id)
    );

    if (missingCasts.length === 0) {
      return;
    }

    for (const cast of missingCasts) {
      if (castCache.has(cast.cast_id)) {
        continue;
      }

      try {
        // const slug = CacheManager.generateSlug(cast.cast_id);

        const newCast = await this.peoplesRepository.create({
          name: cast.original_name,
          tmdbId: cast.cast_id,
        });

        castCache.set(cast.cast_id, newCast.toJSON().id);
        logger.info(`Created cast ${newCast.toJSON().name}`);
      } catch (error) {
        logger.error(`Error creating provider ${cast.original_name}: ${error}`);
      }
    }
  }

  private async ensureSeasonsExist(
    seasons: TMDBSeason[],
    entityId: string
  ): Promise<void> {
    if (this.drizzleRepository.contentType !== "serie") {
      return;
    }

    const uncachedSeasons = seasons.filter(
      (season) => !seasonCache.has(season.id)
    );

    if (uncachedSeasons.length === 0) {
      return;
    }

    const seasonsId = uncachedSeasons.map((season) => season.id);
    const existingSeasons =
      await this.peoplesRepository.getByTMDBIds(seasonsId);

    for (const season of existingSeasons) {
      const jsonSeason = season.toJSON();
      if (jsonSeason.tmdbId !== null) {
        seasonCache.set(jsonSeason.tmdbId, jsonSeason.id);
      }
    }

    const existingTmdbIds = new Set(
      existingSeasons
        .map((season) => season.toJSON().tmdbId)
        .filter((id): id is number => id !== null)
    );

    const missingSeasons = uncachedSeasons.filter(
      (season) => !existingTmdbIds.has(season.id)
    );

    if (missingSeasons.length === 0) {
      return;
    }

    for (const season of missingSeasons) {
      if (seasonCache.has(season.id)) {
        continue;
      }

      try {
        const newSeason = await this.seasonsRepository.createSeason({
          name: season.name,
          seasonNumber: season.season_number,
          seriesId: entityId,
          airDate: season.air_date,
          episodeCount: season.episodes.length,
          overview: season.overview,
          posterUrl: season.poster_path,
        });

        seasonCache.set(season.id, newSeason.toJSON().id);
        logger.info(`Created season ${newSeason.toJSON().name}`);

        await this.ensureEpisodesExist(season.episodes, newSeason.id);
      } catch (error) {
        logger.error(`Error creating season ${season.id}: ${error}`);
      }
    }
  }

  private async ensureEpisodesExist(
    episodes: TMDBEpisode[],
    seasonId: string
  ): Promise<void> {
    if (this.drizzleRepository.contentType !== "serie") {
      return;
    }

    const uncachedEpisodes = episodes.filter(
      (episode) => !episodeCache.has(episode.id)
    );

    if (uncachedEpisodes.length === 0) {
      return;
    }

    const episodesId = uncachedEpisodes.map((episode) => episode.id);
    const existingEpisodes =
      await this.peoplesRepository.getByTMDBIds(episodesId);

    for (const episode of existingEpisodes) {
      const jsonEpisode = episode.toJSON();
      if (jsonEpisode.tmdbId !== null) {
        episodeCache.set(jsonEpisode.tmdbId, jsonEpisode.id);
      }
    }

    const existingTmdbIds = new Set(
      existingEpisodes
        .map((episode) => episode.toJSON().tmdbId)
        .filter((id): id is number => id !== null)
    );

    const missingEpisodes = uncachedEpisodes.filter(
      (episode) => !existingTmdbIds.has(episode.id)
    );

    if (missingEpisodes.length === 0) {
      return;
    }

    for (const episode of missingEpisodes) {
      if (episodeCache.has(episode.id)) {
        continue;
      }

      try {
        const newEpisode = await this.episodesRepository.createEpisode({
          name: episode.name,
          seasonId: seasonId,
          episodeNumber: episode.episode_number,
          overview: episode.overview,
          airDate: episode.air_date,
          durationMinutes: episode.runtime,
          stillUrl: episode.still_path,
          tmdbId: episode.id,
        });

        episodeCache.set(episode.id, newEpisode.toJSON().id);
        logger.info(`Created Episode ${newEpisode.toJSON().name}`);
      } catch (error) {
        logger.error(`Error creating episode ${episode.id}: ${error}`);
      }
    }
  }
}
