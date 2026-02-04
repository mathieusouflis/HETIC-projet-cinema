import { Entity } from "../../../../shared/domain/entity.js";
import type { Category } from "../../../categories/domain/entities/category.entity.js";
import type { Platform } from "../../../platforms/domain/entities/platforms.entity.js";
import type {
  ContentRow,
  contentRelationsSchema,
  NewContentRow,
} from "../../infrastructure/database/schemas/contents.schema.js";

export type ContentType = "movie" | "serie";

export interface ContentJSON {
  id: string;
  type: ContentType;
  title: string;
  originalTitle: string | null;
  slug: string;
  synopsis: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  releaseDate: Date | null;
  year: number | null;
  durationMinutes: number | null;
  tmdbId: number | null;
  averageRating: number;
  totalRatings: number;
  totalViews: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Relation types for Content entity
 */
export interface ContentRelations {
  contentCategories: Category[];
  contentCredits: Category[]; //TEMP
  listItems: Category[]; //TEMP
  notifications: Category[]; //TEMP
  ratings: Category[]; //TEMP
  reviews: Category[]; //TEMP
  seasons: Category[]; //TEMP
  userActivityLogs: Category[]; //TEMP
  watchlists: Category[]; //TEMP
  watchparties: Category[]; //TEMP
  contentPlatforms: Platform[];
}

export class Content extends Entity<
  ContentJSON,
  typeof contentRelationsSchema,
  ContentRelations
> {
  public readonly id: string;
  public readonly type: ContentType;
  public readonly title: string;
  public readonly originalTitle: string | null;
  public readonly slug: string;
  public readonly synopsis: string | null;
  public readonly posterUrl: string | null;
  public readonly backdropUrl: string | null;
  public readonly trailerUrl: string | null;
  public readonly releaseDate: Date | null;
  public readonly year: number | null;
  public readonly durationMinutes: number | null;
  public readonly tmdbId: number | null;
  public readonly averageRating: number;
  public readonly totalRatings: number;
  public readonly totalViews: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: ContentRow) {
    super();
    this.id = props.id;
    this.type = props.type as ContentType;
    this.title = props.title;
    this.originalTitle = props.originalTitle ?? null;
    this.slug = props.slug;
    this.synopsis = props.synopsis ?? null;
    this.posterUrl = props.posterUrl ?? null;
    this.backdropUrl = props.backdropUrl ?? null;
    this.trailerUrl = props.trailerUrl ?? null;
    this.releaseDate = props.releaseDate ? new Date(props.releaseDate) : null;
    this.year = props.year ?? null;
    this.durationMinutes = props.durationMinutes ?? null;
    this.tmdbId = props.tmdbId ?? null;
    this.averageRating = Number.parseFloat(
      props.averageRating?.toString() ?? "0"
    );
    this.totalRatings = props.totalRatings ?? 0;
    this.totalViews = props.totalViews ?? 0;
    this.createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
    this.updatedAt = props.updatedAt ? new Date(props.updatedAt) : new Date();
  }

  /**
   * Check if this content is a movie
   * @returns true if content type is "movie"
   */
  public isMovie(): boolean {
    return this.type === "movie";
  }

  /**
   * Check if this content is a series/TV show
   * @returns true if content type is "series"
   */
  public isSeries(): boolean {
    return this.type === "serie";
  }

  /**
   * Check if the content has a poster image
   * @returns true if posterUrl is set
   */
  public hasPoster(): boolean {
    return this.posterUrl !== null && this.posterUrl.length > 0;
  }

  /**
   * Check if the content has a backdrop image
   * @returns true if backdropUrl is set
   */
  public hasBackdrop(): boolean {
    return this.backdropUrl !== null && this.backdropUrl.length > 0;
  }

  /**
   * Check if the content has a trailer
   * @returns true if trailerUrl is set
   */
  public hasTrailer(): boolean {
    return this.trailerUrl !== null && this.trailerUrl.length > 0;
  }

  /**
   * Check if the content has external IDs
   * @returns true if either tmdbId or imdbId is set
   */
  public hasExternalIds(): boolean {
    return this.tmdbId !== null;
  }

  /**
   * Get the display title (originalTitle if available, otherwise title)
   * @returns title to display
   */
  public getDisplayTitle(): string {
    return this.originalTitle && this.originalTitle.length > 0
      ? `${this.title} (${this.originalTitle})`
      : this.title;
  }

  /**
   * Check if the content has a release date
   * @returns true if releaseDate is set
   */
  public hasReleaseDate(): boolean {
    return this.releaseDate !== null;
  }

  /**
   * Get the duration formatted as a human-readable string
   * @returns formatted duration (e.g., "2h 30m") or null if not a movie
   */
  public getFormattedDuration(): string | null {
    if (!this.durationMinutes || this.durationMinutes <= 0) {
      return null;
    }

    const hours = Math.floor(this.durationMinutes / 60);
    const minutes = this.durationMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    }

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  }

  /**
   * Check if the content has a valid rating
   * @returns true if averageRating is greater than 0
   */
  public hasRating(): boolean {
    return this.averageRating > 0;
  }

  /**
   * Get rating information as an object
   * @returns object with rating and count
   */
  public getRatingInfo(): {
    average: number;
    total: number;
    formatted: string;
  } {
    return {
      average: this.averageRating,
      total: this.totalRatings,
      formatted: this.averageRating.toFixed(2),
    };
  }

  /**
   * Get the age of the content in years
   * @returns number of years since release, or null if no release date
   */
  public getAgeInYears(): number | null {
    if (!this.year) {
      return null;
    }

    return new Date().getFullYear() - this.year;
  }

  /**
   * Check if the content has an average rating higher than a threshold
   * @param threshold - Minimum rating threshold (default: 7.0)
   * @returns true if rating meets threshold
   */
  public isHighlyRated(threshold = 7.0): boolean {
    return this.averageRating >= threshold;
  }

  /**
   * Check if the content is popular based on total views
   * @param threshold - Minimum view count threshold (default: 1000)
   * @returns true if views exceed threshold
   */
  public isPopular(threshold = 1000): boolean {
    return this.totalViews >= threshold;
  }

  /**
   * Convert entity to a plain object (for serialization)
   *
   * @returns Plain object representation without methods
   */
  public toJSON(): ContentJSON {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      originalTitle: this.originalTitle,
      slug: this.slug,
      synopsis: this.synopsis,
      posterUrl: this.posterUrl,
      backdropUrl: this.backdropUrl,
      trailerUrl: this.trailerUrl,
      releaseDate: this.releaseDate,
      year: this.year,
      durationMinutes: this.durationMinutes,
      tmdbId: this.tmdbId,
      averageRating: this.averageRating,
      totalRatings: this.totalRatings,
      totalViews: this.totalViews,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export type CreateContentProps = NewContentRow;

export type UpdateContentProps = Partial<
  Pick<
    ContentRow,
    | "posterUrl"
    | "backdropUrl"
    | "trailerUrl"
    | "averageRating"
    | "totalRatings"
    | "totalViews"
  >
>;
