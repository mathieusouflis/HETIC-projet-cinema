import { eq } from "drizzle-orm";
import { db } from "../../../../database";
import { people } from "../../../../database/schema";
import { ServerError } from "../../../../shared/errors/ServerError";
import { NotFoundError } from "../../../../shared/errors";
import { IPeoplesRepository } from "../../domain/interfaces/IPeoplesRepository";
import { CreatePeopleProps, People, UpdatePeopleProps } from "../../domain/entities/people.entity";

export class PeoplesRepository implements IPeoplesRepository {

  async create(peopleContent: CreatePeopleProps): Promise<People> {
    try {
      const createdContent = await db.insert(people).values(peopleContent).returning();

      const content = createdContent[0];

      if (!content) {
        throw new ServerError('Failed to create people');
      }

      return new People(content);

    } catch (error) {
      if (error instanceof ServerError) {
        throw error;
      }
      throw new ServerError(`Unexpected error creating people: ${error}`);
    }
  }

  async getById(id: string): Promise<People | null> {
    try {
      const resolvedContent = await db.select().from(people).where(eq(people.id, id));
      const content = resolvedContent[0]

      if (!content) {
        throw new NotFoundError(`People with id ${id}`);
      }

      return content ? new People(content) : null;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError(`Unexpected error resolving people ${id}: ${error}`)
    }
  }

  async list(props: {
    nationality?: string;
  }): Promise<People[]> {
      try {
        const resolvedContent = props.nationality
          ? await db.select().from(people).where(eq(people.nationality, props.nationality))
          : await db.select().from(people);
        return resolvedContent.map(content => new People(content));
      } catch (error) {
        throw new ServerError(`Failed to list user watchlist: ${error}`);
      }
    }

    async update(id: string, peopleContent: UpdatePeopleProps): Promise<People> {
      try {
        const updatedContent = await db.update(people)
          .set(peopleContent)
          .where(eq(people.id, id))
          .returning();

        const content = updatedContent[0];

        if (!content) {
          throw new NotFoundError(`People with id ${id}`);
        }

        return new People(content);
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }
        throw new ServerError(`Unexpected error updating people ${id}: ${error}`);
      }
    }

    async delete(id: string): Promise<void> {
      try {
        const deletedCount = await db.delete(people)
          .where(eq(people.id, id))
          .returning();

        if (deletedCount.length === 0) {
          throw new NotFoundError(`People item with id ${id}`);
        }
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }
        throw new ServerError(`Unexpected error deleting people ${id}: ${error}`);
      }
    }
}
