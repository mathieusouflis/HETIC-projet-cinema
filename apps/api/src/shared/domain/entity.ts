import type { Relations } from "drizzle-orm";

/**
 * Interface for entities that can be serialized to JSON
 * All relation entities must implement this interface
 */
export interface JSONSerializable<T = unknown> {
  toJSON(): T;
}

/**
 * Helper type to extract element type from array types
 * If T is an array, returns the element type; otherwise returns T
 */
export type ElementOf<T> = T extends readonly (infer U)[] ? U : T;

/**
 * Helper type to check if a type is an array
 */
export type IsArray<T> = T extends readonly unknown[] ? true : false;

/**
 * Helper type to ensure a type is an array
 */
export type EnsureArray<T> = T extends readonly unknown[] ? T : T[];

/**
 * Constraint for valid relation values
 * Relations must be either a single entity or an array of entities that implement JSONSerializable
 */
export type RelationValue = JSONSerializable | readonly JSONSerializable[];

/**
 * Constraint for the relations map type parameter
 * Keys are relation names, values are either single entities or arrays of entities
 * Uses a mapped type pattern that allows interfaces without index signatures
 */
export type RelationsMap = {
  [key: string]: RelationValue;
};

/**
 * Infer the JSON representation type from a relation value
 * - For arrays: returns an array of the entity's JSON type
 * - For single entities: returns the entity's JSON type
 */
export type InferRelationJSON<T> = T extends readonly (infer E)[]
  ? E extends { toJSON(): infer R }
    ? R[]
    : unknown[]
  : T extends { toJSON(): infer R }
    ? R
    : unknown;

/**
 * Transform a relations map to its JSON representation
 * Each relation's entity type is mapped to its toJSON return type
 */
export type RelationsToJSON<T> = {
  [K in keyof T]: InferRelationJSON<T[K]>;
};

/**
 * Extract keys from relations map where the value is an array (Many relation)
 */
export type ArrayRelationKeys<T> = {
  [K in keyof T]: T[K] extends readonly unknown[] ? K : never;
}[keyof T];

/**
 * Extract keys from relations map where the value is a single entity (One relation)
 */
export type SingleRelationKeys<T> = {
  [K in keyof T]: T[K] extends readonly unknown[] ? never : K;
}[keyof T];

/**
 * Type guard to check if a value is a JSONSerializable entity
 */
function isJSONSerializable(value: unknown): value is JSONSerializable {
  return (
    value !== null &&
    typeof value === "object" &&
    "toJSON" in value &&
    typeof (value as JSONSerializable).toJSON === "function"
  );
}

/**
 * Base Entity class that provides relation management capabilities for domain entities.
 * This abstract class manages relationships between entities using a type-safe approach,
 * ensuring that relations are properly typed and can be serialized to JSON.
 *
 * @template TJson - The JSON representation type returned by toJSON()
 * @template TRelationsSchema - The database relations type from Drizzle ORM schema (for documentation/consistency)
 * @template TRelations - A record type defining all possible relations this entity can have,
 *                        with values being either single entities or arrays of entities
 *
 * @example
 * // Define the JSON output type
 * interface MovieJSON {
 *   id: string;
 *   title: string;
 *   releaseYear: number;
 * }
 *
 * // Define the relations interface
 * interface MovieRelations {
 *   categories: Category[];  // One-to-many relation
 *   director: Director;      // One-to-one relation
 *   actors: Actor[];         // Many-to-many relation
 * }
 *
 * // Extend the Entity class
 * class Movie extends Entity<MovieJSON, typeof movieRelations, MovieRelations> {
 *   constructor(
 *     public id: string,
 *     public title: string,
 *     public releaseYear: number
 *   ) {
 *     super();
 *   }
 *
 *   toJSON(): MovieJSON {
 *     return {
 *       id: this.id,
 *       title: this.title,
 *       releaseYear: this.releaseYear
 *     };
 *   }
 * }
 *
 * // Usage
 * const movie = new Movie("1", "Inception", 2010);
 * movie.addToRelation("actors", new Actor("1", "Leonardo DiCaprio"));
 * movie.setRelation("director", new Director("1", "Christopher Nolan"));
 *
 * const json = movie.toJSONWithRelations({ actors: true });
 * // { id: "1", title: "Inception", releaseYear: 2010, actors: [...] }
 */
export abstract class Entity<
  TJson,
  TRelationsSchema extends Relations = Relations,
  TRelations extends { [K in keyof TRelations]: RelationValue } = Record<
    string,
    RelationValue
  >,
> {
  /**
   * Phantom property to capture the Drizzle ORM relations schema type.
   * This is used for type inference and documentation purposes.
   * Never access this property at runtime.
   */
  protected readonly _relationsSchema!: TRelationsSchema;

  /**
   * Internal storage for relations using a Map for efficient key-based access
   */
  protected readonly relations = new Map<
    keyof TRelations,
    TRelations[keyof TRelations]
  >();

  /**
   * Adds a single entity to an array relation.
   * This method should only be used for relations that are arrays (Many relations).
   * If the relation doesn't exist, it creates a new array with the entity.
   * If it exists, it appends the entity to the array.
   *
   * @template K - The relation key type (must be a key of TRelations)
   * @param key - The relation key/name (should be an array relation)
   * @param entity - The entity to add to the relation array
   *
   * @example
   * const movie = new Movie("1", "Inception", 2010);
   * const actor = new Actor("1", "Leonardo DiCaprio");
   * movie.addToRelation("actors", actor);
   * movie.addToRelation("actors", new Actor("2", "Tom Hardy"));
   */
  public addToRelation<K extends ArrayRelationKeys<TRelations>>(
    key: K,
    entity: ElementOf<TRelations[K]>
  ): void {
    const existing = this.relations.get(key);

    if (existing === undefined) {
      this.relations.set(key, [entity] as unknown as TRelations[K]);
    } else if (Array.isArray(existing)) {
      (existing as unknown[]).push(entity);
    } else {
      // Convert single value to array (shouldn't happen with proper typing, but handle gracefully)
      this.relations.set(key, [existing, entity] as unknown as TRelations[K]);
    }
  }

  /**
   * Sets a single (One) relation.
   * This method should be used for one-to-one relations.
   *
   * @template K - The relation key type (must be a single relation key)
   * @param key - The relation key/name
   * @param entity - The entity to set as the relation
   *
   * @example
   * const movie = new Movie("1", "Inception", 2010);
   * const director = new Director("1", "Christopher Nolan");
   * movie.setRelation("director", director);
   */
  public setRelation<K extends SingleRelationKeys<TRelations>>(
    key: K,
    entity: TRelations[K]
  ): void {
    this.relations.set(key, entity);
  }

  /**
   * Sets or replaces all relations for a specific key.
   * This will overwrite any existing relations for that key.
   * Works for both single and array relations.
   *
   * @template K - The relation key type
   * @param key - The relation key/name
   * @param relations - Single relation entity or array of relation entities
   *
   * @example
   * const movie = new Movie("1", "Inception", 2010);
   * const actors = [new Actor("1", "Leonardo"), new Actor("2", "Tom Hardy")];
   * movie.setRelations("actors", actors);
   */
  public setRelations<K extends keyof TRelations>(
    key: K,
    relations: TRelations[K]
  ): void {
    this.relations.set(key, relations);
  }

  /**
   * Retrieves relations associated with a specific key.
   *
   * @template K - The relation key type
   * @param key - The relation key/name
   * @returns The relation(s) associated with the key, or undefined if not found
   *
   * @example
   * const actors = movie.getRelations("actors");
   * if (actors) {
   *   console.log(actors); // Actor[]
   * }
   *
   * const director = movie.getRelations("director");
   * if (director) {
   *   console.log(director); // Director
   * }
   */
  public getRelations<K extends keyof TRelations>(
    key: K
  ): TRelations[K] | undefined {
    return this.relations.get(key) as TRelations[K] | undefined;
  }

  /**
   * Retrieves a single relation entity from an array relation at a specific index.
   *
   * @template K - The relation key type (must be an array relation)
   * @param key - The relation key/name
   * @param index - The index of the entity to retrieve (default: 0)
   * @returns The entity at the specified index, or undefined if not found
   *
   * @example
   * const firstActor = movie.getRelationAt("actors", 0);
   */
  public getRelationAt<K extends ArrayRelationKeys<TRelations>>(
    key: K,
    index = 0
  ): ElementOf<TRelations[K]> | undefined {
    const relations = this.relations.get(key);
    if (Array.isArray(relations)) {
      return relations[index] as ElementOf<TRelations[K]> | undefined;
    }
    return undefined;
  }

  /**
   * Checks whether the entity has any relations stored for a specific key.
   *
   * @template K - The relation key type
   * @param key - The relation key/name to check
   * @returns True if relations exist for this key, false otherwise
   *
   * @example
   * if (movie.hasRelations("actors")) {
   *   const actors = movie.getRelations("actors");
   * }
   */
  public hasRelations<K extends keyof TRelations>(key: K): boolean {
    const value = this.relations.get(key);
    if (value === undefined) {
      return false;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return true;
  }

  /**
   * Gets the count of relations for a specific key.
   *
   * @template K - The relation key type
   * @param key - The relation key/name
   * @returns The number of relations (1 for single relations, length for arrays, 0 if not set)
   *
   * @example
   * const actorCount = movie.getRelationCount("actors"); // e.g., 5
   * const hasDirector = movie.getRelationCount("director"); // 0 or 1
   */
  public getRelationCount<K extends keyof TRelations>(key: K): number {
    const value = this.relations.get(key);
    if (value === undefined) {
      return 0;
    }
    if (Array.isArray(value)) {
      return value.length;
    }
    return 1;
  }

  /**
   * Removes all relations associated with a specific key from the entity.
   *
   * @template K - The relation key type
   * @param key - The relation key/name to remove
   *
   * @example
   * movie.removeRelations("actors"); // Removes all actor relations
   */
  public removeRelations<K extends keyof TRelations>(key: K): void {
    this.relations.delete(key);
  }

  /**
   * Removes a specific entity from an array relation.
   *
   * @template K - The relation key type (must be an array relation)
   * @param key - The relation key/name
   * @param predicate - Function to identify which entity to remove
   * @returns True if an entity was removed, false otherwise
   *
   * @example
   * movie.removeFromRelation("actors", actor => actor.id === "1");
   */
  public removeFromRelation<K extends ArrayRelationKeys<TRelations>>(
    key: K,
    predicate: (entity: ElementOf<TRelations[K]>) => boolean
  ): boolean {
    const relations = this.relations.get(key);
    if (!Array.isArray(relations)) {
      return false;
    }

    const index = relations.findIndex(
      predicate as (entity: unknown) => boolean
    );
    if (index === -1) {
      return false;
    }

    relations.splice(index, 1);
    return true;
  }

  /**
   * Retrieves all relation keys that have been set on this entity.
   *
   * @returns An array of relation keys
   *
   * @example
   * const keys = movie.getRelationKeys();
   * console.log(keys); // ["actors", "director", "categories"]
   */
  public getRelationKeys(): (keyof TRelations)[] {
    return Array.from(this.relations.keys());
  }

  /**
   * Removes all relations from the entity, clearing the entire relations map.
   *
   * @example
   * movie.clearRelations(); // Removes all relations from the movie
   */
  public clearRelations(): void {
    this.relations.clear();
  }

  /**
   * Converts a single relation entity to its JSON representation.
   * Handles both entities with toJSON methods and plain objects.
   *
   * @param entity - The entity to convert
   * @returns The JSON representation of the entity
   */
  protected entityToJSON<E extends JSONSerializable>(
    entity: E
  ): ReturnType<E["toJSON"]> {
    if (isJSONSerializable(entity)) {
      return entity.toJSON() as ReturnType<E["toJSON"]>;
    }
    return entity as unknown as ReturnType<E["toJSON"]>;
  }

  /**
   * Converts all relations to their JSON representation.
   * This method calls toJSON() on all relation entities.
   *
   * @returns An object containing all relations in JSON format
   *
   * @example
   * const relationsJSON = movie.JSONRelations();
   * // Returns: { actors: [{id: "1", name: "Leonardo"}], director: {id: "1", name: "Nolan"} }
   */
  public JSONRelations(): Partial<RelationsToJSON<TRelations>> {
    const result: Partial<Record<keyof TRelations, unknown>> = {};

    for (const [key, value] of this.relations.entries()) {
      if (Array.isArray(value)) {
        result[key] = (value as JSONSerializable[]).map((entity) =>
          this.entityToJSON(entity)
        );
      } else if (isJSONSerializable(value)) {
        result[key] = this.entityToJSON(value);
      } else {
        result[key] = value;
      }
    }

    return result as Partial<RelationsToJSON<TRelations>>;
  }

  /**
   * Converts the entity and optionally its relations to JSON format.
   * Allows selective inclusion of relations using the options parameter.
   *
   * @template K - The relation keys to potentially include
   * @param options - Optional object specifying which relations to include.
   *                  If not provided, all set relations are included.
   *                  Keys should be relation names with boolean values (true to include).
   * @returns JSON object containing the entity data and selected relations
   *
   * @example
   * // Include all set relations
   * const fullJSON = movie.toJSONWithRelations();
   *
   * @example
   * // Include only specific relations
   * const partialJSON = movie.toJSONWithRelations({ actors: true, director: true });
   *
   * @example
   * // Type-safe: only valid relation keys are allowed
   * const json = movie.toJSONWithRelations({ invalidKey: true }); // TypeScript error!
   */
  public toJSONWithRelations<K extends keyof TRelations = keyof TRelations>(
    options?: Partial<Record<K, boolean>>
  ): TJson & Partial<RelationsToJSON<TRelations>> {
    const entityJSON = this.toJSON();
    const allRelations = this.JSONRelations();

    if (!options) {
      return { ...entityJSON, ...allRelations };
    }

    const filteredRelations: Partial<Record<keyof TRelations, unknown>> = {};

    for (const key of Object.keys(allRelations) as (keyof TRelations)[]) {
      if (options[key as K]) {
        filteredRelations[key] = allRelations[key];
      }
    }

    return {
      ...entityJSON,
      ...filteredRelations,
    } as TJson & Partial<RelationsToJSON<TRelations>>;
  }

  /**
   * Converts the entity's own properties (excluding relations) to a JSON-serializable object.
   * This method must be implemented by all classes extending Entity.
   *
   * @returns A plain object containing the entity's properties
   *
   * @example
   * public toJSON(): MovieJSON {
   *   return {
   *     id: this.id,
   *     title: this.title,
   *     releaseYear: this.releaseYear
   *   };
   * }
   */
  public abstract toJSON(): TJson;
}

/**
 * Type helper to extract the JSON type from an Entity class
 *
 * @example
 * type MovieJSON = EntityJSON<Movie>; // { id: string; title: string; ... }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EntityJSON<E extends Entity<unknown, Relations, any>> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E extends Entity<infer T, Relations, any> ? T : never;

/**
 * Type helper to extract the relations type from an Entity class
 *
 * @example
 * type MovieRelations = EntityRelations<Movie>; // { actors: Actor[]; director: Director; ... }
 */
export type EntityRelations<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E extends Entity<unknown, Relations, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = E extends Entity<unknown, Relations, infer R> ? R : never;

/**
 * Type helper to get the full JSON type including all relations
 *
 * @example
 * type FullMovieJSON = EntityJSONWithRelations<Movie>;
 */
export type EntityJSONWithRelations<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E extends Entity<unknown, Relations, any>,
> =
  E extends Entity<infer T, Relations, infer R>
    ? T & Partial<RelationsToJSON<R>>
    : never;
