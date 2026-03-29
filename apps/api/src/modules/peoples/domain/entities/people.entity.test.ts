import { describe, expect, it } from "vitest";
import { People } from "./people.entity.js";

describe("People entity", () => {
  const baseRow = {
    id: "p1",
    name: "John Doe",
    bio: "Actor",
    photoUrl: "https://img.test/p1.jpg",
    birthDate: "1990-03-20",
    nationality: "FR",
    tmdbId: 42,
    createdAt: "2024-01-01T10:00:00.000Z",
    updatedAt: "2024-01-02T10:00:00.000Z",
  };

  it("construit l'entite et normalise les dates", () => {
    const people = new People(baseRow);

    expect(people.id).toBe("p1");
    expect(people.name).toBe("John Doe");
    expect(people.birthDate).toBeInstanceOf(Date);
    expect(people.createdAt).toBeInstanceOf(Date);
    expect(people.updatedAt).toBeInstanceOf(Date);
  });

  it("retourne null sur getAge quand birthDate est absente", () => {
    const people = new People({ ...baseRow, birthDate: null });
    expect(people.getAge(new Date("2024-03-20"))).toBeNull();
  });

  it("calcule l'age a partir d'une date de reference", () => {
    const people = new People(baseRow);
    expect(people.getAge(new Date("2024-03-20"))).toBe(34);
  });

  it("serialise l'entite avec toJSON", () => {
    const people = new People(baseRow);
    const json = people.toJSON();

    expect(json.id).toBe("p1");
    expect(json.name).toBe("John Doe");
    expect(json.tmdbId).toBe(42);
    expect(json.birthDate).toBeInstanceOf(Date);
  });

  it("construit depuis fromNew avec valeurs par defaut", () => {
    const people = People.fromNew({
      name: "Jane Doe",
      bio: null,
      photoUrl: null,
      birthDate: null,
      nationality: null,
      tmdbId: null,
    });

    expect(people.id).toBe("");
    expect(people.name).toBe("Jane Doe");
    expect(people.createdAt).toBeInstanceOf(Date);
    expect(people.updatedAt).toBeInstanceOf(Date);
  });
});
