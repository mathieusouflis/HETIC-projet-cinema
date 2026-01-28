import type {
  NewPeopleRow,
  PeopleRow,
} from "../../infrastructure/schemas/people.schema.js";

/**
 * Domain entity representing a person (actor, director, etc.)
 * based on the database schema.
 */
export class People {
  public readonly id: string;
  public readonly name: string;
  public readonly bio: string | null;
  public readonly photoUrl: string | null;
  public readonly birthDate: Date | null;
  public readonly nationality: string | null;
  public readonly tmdbId: number | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: PeopleRow) {
    this.id = props.id;
    this.name = props.name;
    this.bio = props.bio ?? null;
    this.photoUrl = props.photoUrl ?? null;
    this.birthDate = props.birthDate ? new Date(props.birthDate) : null;
    this.nationality = props.nationality ?? null;
    this.tmdbId = props.tmdbId ?? null;
    this.createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
    this.updatedAt = props.updatedAt ? new Date(props.updatedAt) : new Date();
  }

  /**
   * Returns the person's age in years if birth date is known, otherwise null.
   */
  public getAge(referenceDate: Date = new Date()): number | null {
    if (!this.birthDate) {
      return null;
    }
    const diff = referenceDate.getTime() - this.birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  /**
   * Convenience: serialize entity to a plain object suitable for transport/storage.
   * Dates are kept as Date instances (caller can convert to ISO if needed).
   */
  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      bio: this.bio,
      photoUrl: this.photoUrl,
      birthDate: this.birthDate,
      nationality: this.nationality,
      tmdbId: this.tmdbId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromNew(props: NewPeopleRow): People {
    const row: PeopleRow = {
      id: props.id ?? "",
      name: props.name,
      bio: props.bio ?? null,
      photoUrl: props.photoUrl ?? null,
      birthDate: props.birthDate ?? null,
      nationality: props.nationality ?? null,
      tmdbId: props.tmdbId ?? null,
      createdAt: props.createdAt ?? new Date().toISOString(),
      updatedAt: props.updatedAt ?? new Date().toISOString(),
    };

    return new People(row);
  }
}

export type CreatePeopleProps = NewPeopleRow;

export type UpdatePeopleProps = Partial<
  Pick<
    PeopleRow,
    | "name"
    | "bio"
    | "photoUrl"
    | "birthDate"
    | "nationality"
    | "tmdbId"
    | "updatedAt"
  >
>;
