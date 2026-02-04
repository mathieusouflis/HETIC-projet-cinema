import type { streamingPlatformsRelations } from "../../../../database/schema";
import { Entity } from "../../../../shared/domain/entity";
import type { Content } from "../../../contents/domain/entities/content.entity";
import type { Watchparty } from "../../../watchparty";
import type {
  NewStreamingPlatformRow,
  StreamingPlatformRow,
} from "../../infrastructure/database/platforms.schema";

/**
 * JSON representation of a Platform entity
 */
export interface PlatformJSON {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  baseUrl: string | null;
  tmdbId: number | null;
  isSupported: boolean | null;
  createdAt: Date | null;
}

/**
 * Relation types for Platform entity
 */
export interface PlatformRelations {
  contents: Content[];
  watchparties: Watchparty[]; // TEMP
}

/**
 * Represents a streaming platform entity.
 * Extends the base `Entity` class with specific properties and methods
 * for handling streaming platform data.
 */
export class Platform extends Entity<
  PlatformJSON,
  typeof streamingPlatformsRelations,
  PlatformRelations
> {
  private readonly id: string;
  private readonly name: string;
  private readonly slug: string;
  private readonly logoUrl: string | null;
  private readonly baseUrl: string | null;
  private readonly tmdbId: number | null;
  private readonly isSupported: boolean | null;
  private readonly createdAt: Date | null;

  /**
   * Constructs a new `Platform` instance.
   * @param props - The properties of the streaming platform.
   */
  constructor(props: StreamingPlatformRow) {
    super();
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.logoUrl = props.logoUrl;
    this.baseUrl = props.baseUrl;
    this.tmdbId = props.tmdbId;
    this.isSupported = props.isSupported;
    this.createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
  }

  /**
   * Checks if the platform has a logo.
   * @returns `true` if the platform has a logo, otherwise `false`.
   */
  public hasLogo(): boolean {
    return !!this.logoUrl;
  }

  /**
   * Determines if the platform is supported.
   * @returns `true` if the platform is supported, otherwise `false`.
   */
  public isPlatformSupported(): boolean {
    return this.isSupported ?? false;
  }

  /**
   * Converts the platform instance to a JSON representation.
   * @returns An object containing the platform's properties.
   */
  public toJSON(): PlatformJSON {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      logoUrl: this.logoUrl,
      baseUrl: this.baseUrl,
      tmdbId: this.tmdbId,
      isSupported: this.isSupported,
      createdAt: this.createdAt,
    };
  }
}

export type UpdatePlatformProps = Partial<
  Pick<
    NewStreamingPlatformRow,
    "baseUrl" | "isSupported" | "logoUrl" | "name" | "slug"
  >
>;
