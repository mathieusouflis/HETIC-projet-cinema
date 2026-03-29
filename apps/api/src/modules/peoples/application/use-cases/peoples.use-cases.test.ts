import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { CreatePeopleUseCase } from "./create-people.use-case";
import { DeletePeopleUseCase } from "./delete-people.use-case";
import { GetPeopleUseCase } from "./get-people.use-case";
import { ListPeoplesUseCase } from "./list-peoples.use-case";
import { SearchPeopleUseCase } from "./search-people.use-case";
import { UpdatePeopleUseCase } from "./update-people.use-case";

const person = { id: "p1", toJSON: () => ({ id: "p1" }) };

describe("peoples use-cases", () => {
  it("create/get/delete/update flows", async () => {
    const repo = {
      create: vi.fn().mockResolvedValue(person),
      getById: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(person),
    };
    await expect(
      new CreatePeopleUseCase(repo as never).execute({} as never)
    ).resolves.toBe(person);

    repo.getById.mockResolvedValueOnce(null);
    await expect(
      new GetPeopleUseCase(repo as never).execute("p1")
    ).rejects.toBeInstanceOf(NotFoundError);
    repo.getById.mockResolvedValueOnce(person);
    await expect(
      new GetPeopleUseCase(repo as never).execute("p1")
    ).resolves.toBe(person);

    repo.getById.mockResolvedValueOnce(null);
    await expect(
      new DeletePeopleUseCase(repo as never).execute("p1")
    ).rejects.toBeInstanceOf(NotFoundError);
    repo.getById.mockResolvedValueOnce(person);
    await expect(
      new DeletePeopleUseCase(repo as never).execute("p1")
    ).resolves.toBeUndefined();

    repo.getById.mockResolvedValueOnce(null);
    await expect(
      new UpdatePeopleUseCase(repo as never).execute("p1", {} as never)
    ).rejects.toBeInstanceOf(NotFoundError);
    repo.getById.mockResolvedValueOnce(person);
    await expect(
      new UpdatePeopleUseCase(repo as never).execute("p1", {} as never)
    ).resolves.toBe(person);
  });

  it("list and search flows", async () => {
    const repo = {
      list: vi.fn().mockResolvedValue({ data: [person], total: 1 }),
      searchPeople: vi.fn().mockResolvedValue([person]),
    };
    const listRes = await new ListPeoplesUseCase(repo as never).execute({
      offset: 0,
      limit: 10,
    });
    expect(listRes.data.items).toHaveLength(1);

    const searchUseCase = new SearchPeopleUseCase(repo as never);
    const empty = await searchUseCase.execute({ query: " " });
    expect(empty.data.items).toHaveLength(0);

    const filled = await searchUseCase.execute({
      query: "john",
      page: 1,
      limit: 10,
    });
    expect(filled.data.items).toHaveLength(1);
  });
});
