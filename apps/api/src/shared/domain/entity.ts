import type { Many, One, Relations } from "drizzle-orm";

type EntityAnyType = Entity<any, any, any>;
type ElementOf<T> = T extends (infer U)[] ? U : T;

type ExtractRelations<T> = T extends { config: (helpers: any) => infer R }
  ? R
  : never;

type RelationTypes<Relations> = {
  [K in keyof Relations]: Relations[K] extends Many<any>
    ? EntityAnyType[]
    : Relations[K] extends One<any>
      ? EntityAnyType
      : EntityAnyType;
};

type RelationJSONTypes<T> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? U extends { toJSON(): infer R }
      ? R[]
      : any[]
    : T[K] extends { toJSON(): infer R }
      ? R
      : any;
};

/**
 * Base Entity class that provides relation management capabilities for domain entities.
 * This abstract class manages relationships between entities using a type-safe approach,
 * ensuring that relations are properly typed and can be serialized to JSON.
 *
 * @template S - The type of the main entity (self-reference for proper typing)
 * @template R - The database relations type from Drizzle ORM schema
 * @template T - A record type defining all possible relations this entity can have,
 *               with values being either single entities or arrays of entities
 * @template K - (Auto-inferred, do not specify) Keys of the relations type T
 *
 * @example
 * // Define the relations interface
 * interface MovieRelations {
 *   categories: Category[];  // One-to-many relation
 *   director: Director;      // One-to-one relation
 *   actors: Actor[];         // Many-to-many relation
 * }
 *
 * // Extend the Entity class
 * class Movie extends Entity<Movie, typeof movieRelations, MovieRelations> {
 *   constructor(
 *     public id: string,
 *     public title: string,
 *     public releaseYear: number
 *   ) {
 *     super();
 *   }
 *
 *   toJSON() {
 *     return {
 *       id: this.id,
 *       title: this.title,
 *       releaseYear: this.releaseYear
 *     };
 *   }
 * }
 */
export abstract class Entity<
  S,
  R extends Relations,
  T extends RelationTypes<ExtractRelations<R>>,
  K extends keyof T = keyof T,
> {
  protected relations: Map<K, T[K]> = new Map();

  /**
   * Adds a single relation to the entity. If the relation key doesn't exist,
   * it creates a new entry. If it exists and is an array, it appends to it.
   * If it exists as a single value, it converts it to an array with both values.
   *
   * @param key - The relation key/name (strongly typed from the relations interface)
   * @param relation - The relation entity to add (type-checked based on the key)
   *
   * @example
   * const movie = new Movie("1", "Inception", 2010);
   * const actor = new Actor("1", "Leonardo DiCaprio");
   * movie.addRelation("actors", actor);
   */
  public addRelation(key: K, relation: ElementOf<T[K]>): void {
    const existing = this.relations.get(key);

    if (existing === undefined) {
      this.relations.set(key, relation as T[K]);
    } else if (Array.isArray(existing)) {
      existing.push(relation);
    } else {
      this.relations.set(key, [existing, relation] as T[K]);
    }
  }

  /**
   * Sets or replaces all relations for a specific key. This will overwrite
   * any existing relations for that key.
   *
   * @param key - The relation key/name
   * @param relations - Single relation entity or array of relation entities
   *
   * @example
   * const movie = new Movie("1", "Inception", 2010);
   * const actors = [new Actor("1", "Leonardo"), new Actor("2", "Tom Hardy")];
   * movie.setRelations("actors", actors);
   */
  public setRelations(key: K, relations: T[K]): void {
    this.relations.set(key, relations);
  }

  /**
   * Retrieves relations associated with a specific key.
   *
   * @param key - The relation key/name
   * @returns The relation(s) associated with the key, or undefined if not found
   *
   * @example
   * const actors = movie.getRelations("actors");
   * if (actors) {
   *   console.log(actors); // Array of Actor entities
   * }
   */
  public getRelations(key: K): T[K] | T[K][] | undefined {
    return this.relations.get(key);
  }

  /**
   * Checks whether the entity has any relations stored for a specific key.
   *
   * @param key - The relation key/name to check
   * @returns True if relations exist for this key, false otherwise
   *
   * @example
   * if (movie.hasRelations("actors")) {
   *   const actors = movie.getRelations("actors");
   * }
   */
  public hasRelations(key: K): boolean {
    return this.relations.has(key);
  }

  /**
   * Removes all relations associated with a specific key from the entity.
   *
   * @param key - The relation key/name to remove
   *
   * @example
   * movie.removeRelations("actors"); // Removes all actor relations
   */
  public removeRelations(key: K): void {
    this.relations.delete(key);
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
  public getRelationKeys(): K[] {
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
   * Converts all relations to their JSON representation. This method assumes
   * all relation entities implement a toJSON() method that returns their
   * serializable representation.
   *
   * @returns An object containing all relations in JSON format
   *
   * @example
   * const relationsJSON = movie.JSONRelations();
   * // Returns: { actors: [{id: "1", name: "Leonardo"}], director: {id: "1", name: "Nolan"} }
   */
  public JSONRelations(): RelationJSONTypes<T> {
    const relationsObject = {} as Record<K, any>;
    for (const [key, value] of this.relations.entries()) {
      relationsObject[key] = Array.isArray(value)
        ? value.map((relation) =>
            this.relationToJSON(relation as ElementOf<T[K]>)
          )
        : this.relationToJSON(value as ElementOf<T[K]>);
    }
    return relationsObject as RelationJSONTypes<T>;
  }

  /**
   * Helper method to convert a single relation entity to its JSON representation.
   * By default, calls the relation's toJSON() method if it exists, otherwise
   * returns the relation as-is.
   *
   * Override this method in subclasses if your relations use a different
   * serialization pattern or require custom transformation logic.
   *
   * @param relation - The relation entity to convert
   * @returns The JSON representation of the relation
   *
   * @example
   * protected relationToJSON<Z extends ElementOf<T[K]>>(relation: Z) {
   *   return relation?.toDTO() ?? relation; // Use custom DTO method
   * }
   */
  protected relationToJSON<Z extends ElementOf<T[K]>>(
    relation: Z
  ): Record<keyof Z, any> {
    return relation?.toJSON() ?? relation;
  }

  /**
   * Converts the entity and optionally its relations to JSON format.
   * Allows selective inclusion of relations using the options parameter.
   *
   * @param options - Optional object specifying which relations to include.
   *                  If not provided, all relations are included.
   *                  Keys should be relation names with boolean values (true to include).
   * @returns JSON object containing the entity data and selected relations
   *
   * @example
   * // Include all relations
   * const fullJSON = movie.toJSONWithRelations();
   *
   * @example
   * // Include only specific relations
   * const partialJSON = movie.toJSONWithRelations({ actors: true, director: true });
   */
  public toJSONWithRelations(options?: Partial<Record<K, boolean>>) {
    const relations = this.JSONRelations();
    const entityJSON = this.toJSON();
    if (!options) {
      return { ...entityJSON, ...relations };
    }
    const filteredRelations = Object.entries(relations).reduce(
      (acc, [key, value]) => {
        if (options?.[key as K]) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<K, RelationJSONTypes<T[K]>>
    );

    return { ...entityJSON, ...filteredRelations };
  }

  /**
   * Converts the entity's own properties (excluding relations) to a JSON-serializable object.
   * This method must be implemented by all classes extending Entity.
   *
   * @returns A plain object containing the entity's properties
   *
   * @example
   * public toJSON() {
   *   return {
   *     id: this.id,
   *     title: this.title,
   *     releaseYear: this.releaseYear
   *   };
   * }
   */
  public abstract toJSON(): Record<keyof S, any>;
}
