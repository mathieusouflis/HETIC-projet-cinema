import type {
  CreatePeopleProps,
  People,
  UpdatePeopleProps,
} from "../entities/people.entity";

export interface IPeoplesRepository {
  create(people: CreatePeopleProps): Promise<People>;
  getById(id: string): Promise<People | null>;
  list(params: {
    nationality?: string;
    name?: string;
    limit?: number;
    offset?: number;
  }): Promise<People[]>;
  update(id: string, people: UpdatePeopleProps): Promise<People>;
  delete(id: string): Promise<void>;
  searchPeople(query: string, page?: number): Promise<People[]>;
  getCount(params?: { nationality?: string; name?: string }): Promise<number>;
}
