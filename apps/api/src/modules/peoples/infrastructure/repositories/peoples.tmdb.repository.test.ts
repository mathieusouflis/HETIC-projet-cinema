import { beforeEach, describe, expect, it, vi } from "vitest";
import { MetadataNotFoundError } from "../../../contents/infrastructure/database/repositories/tmdb-fetch-status/errors/metadata-not-found.js";
import { PeoplesTMDBRepository } from "./peoples.tmdb.repository.js";

const {
  deleteSearchMetadataMock,
  getSearchMetadataMock,
  MockTMDBFetchStatusRepository,
  MockTmdbService,
  requestMock,
  setSearchMetadataMock,
} = vi.hoisted(() => {
  const requestMock = vi.fn();
  const setSearchMetadataMock = vi.fn();
  const getSearchMetadataMock = vi.fn();
  const deleteSearchMetadataMock = vi.fn();

  class MockTmdbService {
    request = requestMock;
  }

  class MockTMDBFetchStatusRepository {
    setSearchMetadata = setSearchMetadataMock;
    getSearchMetadata = getSearchMetadataMock;
    deleteSearchMetadata = deleteSearchMetadataMock;
  }

  return {
    deleteSearchMetadataMock,
    getSearchMetadataMock,
    MockTMDBFetchStatusRepository,
    MockTmdbService,
    requestMock,
    setSearchMetadataMock,
  };
});

vi.mock("../../../../shared/services/tmdb/tmdb-service.js", () => ({
  TmdbService: MockTmdbService,
}));

vi.mock(
  "../../../contents/infrastructure/database/repositories/tmdb-fetch-status/tmdb-fetch-status.repository.js",
  () => ({
    TMDBFetchStatusRepository: MockTMDBFetchStatusRepository,
  })
);

describe("PeoplesTMDBRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const details = {
    adult: false,
    also_known_as: [],
    biography: "Bio",
    birthday: "1990-01-01",
    deathday: null,
    gender: 1,
    homepage: null,
    id: 7,
    imdb_id: "nm1",
    known_for_department: "Acting",
    name: "Star",
    place_of_birth: "Paris",
    popularity: 10,
    profile_path: "/pic.jpg",
  };

  it("getPersonById parse les details TMDB", async () => {
    requestMock.mockResolvedValueOnce(details);
    const repo = new PeoplesTMDBRepository();
    const person = await repo.getPersonById(7);
    expect(person?.name).toBe("Star");
    expect(person?.tmdbId).toBe(7);
    expect(person?.photoUrl).toContain("pic.jpg");
    expect(person?.nationality).toBe("Paris");
  });

  it("getPersonById retourne null en cas d erreur API", async () => {
    requestMock.mockRejectedValueOnce(new Error("network"));
    const repo = new PeoplesTMDBRepository();
    await expect(repo.getPersonById(1)).resolves.toBeNull();
  });

  it("searchPeople mappe les resultats et enregistre les metadonnees", async () => {
    requestMock.mockResolvedValueOnce({
      page: 1,
      results: [
        {
          adult: false,
          gender: 1,
          id: 2,
          known_for_department: "Acting",
          name: "A",
          original_name: "A",
          popularity: 1,
          profile_path: null,
          known_for: [],
        },
      ],
      total_pages: 1,
      total_results: 1,
    });
    const repo = new PeoplesTMDBRepository();
    const people = await repo.searchPeople("a", 1);
    expect(people).toHaveLength(1);
    expect(people[0]?.tmdbId).toBe(2);
    expect(setSearchMetadataMock).toHaveBeenCalledWith("a", { page: 1 });
  });

  it("searchPeople retourne [] si la requete echoue", async () => {
    requestMock.mockRejectedValueOnce(new Error("fail"));
    const repo = new PeoplesTMDBRepository();
    await expect(repo.searchPeople("x")).resolves.toEqual([]);
  });

  it("getPeopleByIds filtre les reponses nulles", async () => {
    requestMock
      .mockResolvedValueOnce(details)
      .mockRejectedValueOnce(new Error("missing"));
    const repo = new PeoplesTMDBRepository();
    const people = await repo.getPeopleByIds([7, 8]);
    expect(people).toHaveLength(1);
    expect(people[0]?.tmdbId).toBe(7);
  });

  it("hasSearchBeenCached retourne true si metadonnees presentes", async () => {
    getSearchMetadataMock.mockResolvedValueOnce({});
    const repo = new PeoplesTMDBRepository();
    await expect(repo.hasSearchBeenCached("q")).resolves.toBe(true);
  });

  it("hasSearchBeenCached retourne false si MetadataNotFoundError", async () => {
    getSearchMetadataMock.mockRejectedValueOnce(new MetadataNotFoundError("x"));
    const repo = new PeoplesTMDBRepository();
    await expect(repo.hasSearchBeenCached("q")).resolves.toBe(false);
  });

  it("hasSearchBeenCached propage les autres erreurs", async () => {
    getSearchMetadataMock.mockRejectedValueOnce(new Error("other"));
    const repo = new PeoplesTMDBRepository();
    await expect(repo.hasSearchBeenCached("q")).rejects.toThrow("other");
  });

  it("clearSearchCache delegue au repository de statut", async () => {
    const repo = new PeoplesTMDBRepository();
    await repo.clearSearchCache("q");
    expect(deleteSearchMetadataMock).toHaveBeenCalledWith("q");
  });
});
