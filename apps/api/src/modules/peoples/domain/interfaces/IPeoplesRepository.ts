import { CreatePeopleProps, People, UpdatePeopleProps } from "../entities/people.entity";

export interface IPeoplesRepository {
  create(watchlist: CreatePeopleProps): Promise<People>;
  getById(id: string): Promise<People | null>;
  list(params: {
    nationality?: string;
  }): Promise<People[]>;
  update(id: string, watchlist: UpdatePeopleProps): Promise<People>;
  delete(id: string): Promise<void>;
}
