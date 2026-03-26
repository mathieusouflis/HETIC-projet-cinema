import { describe, expect, it } from "vitest";
import { Entity } from "./entity.js";

type TagJson = { id: string; name: string };
type ChildJson = { id: string; label: string };
type ParentJson = { id: string; title: string };

type ChildRelations = {
  tags: TagEntity[];
};

type ParentRelations = {
  child: ChildEntity;
  tags: TagEntity[];
};

class TagEntity extends Entity<TagJson> {
  constructor(
    private readonly id: string,
    private readonly name: string
  ) {
    super();
  }

  toJSON(): TagJson {
    return { id: this.id, name: this.name };
  }
}

class ChildEntity extends Entity<ChildJson, never, ChildRelations> {
  constructor(
    private readonly id: string,
    private readonly label: string
  ) {
    super();
  }

  toJSON(): ChildJson {
    return { id: this.id, label: this.label };
  }
}

class ParentEntity extends Entity<ParentJson, never, ParentRelations> {
  constructor(
    private readonly id: string,
    private readonly title: string
  ) {
    super();
  }

  toJSON(): ParentJson {
    return { id: this.id, title: this.title };
  }
}

describe("Entity", () => {
  it("addToRelation should create and append array relations", () => {
    const parent = new ParentEntity("p1", "parent");
    const tag1 = new TagEntity("t1", "one");
    const tag2 = new TagEntity("t2", "two");

    parent.addToRelation("tags", tag1);
    parent.addToRelation("tags", tag2);

    expect(parent.getRelationCount("tags")).toBe(2);
    expect(parent.getRelationAt("tags", 0)?.toJSON()).toEqual({
      id: "t1",
      name: "one",
    });
    expect(parent.getRelationAt("tags", 1)?.toJSON()).toEqual({
      id: "t2",
      name: "two",
    });
  });

  it("setRelation and getRelations should work for single relation", () => {
    const parent = new ParentEntity("p1", "parent");
    const child = new ChildEntity("c1", "child");

    parent.setRelation("child", child);

    expect(parent.hasRelations("child")).toBe(true);
    expect(parent.getRelationCount("child")).toBe(1);
    expect(parent.getRelations("child")?.toJSON()).toEqual({
      id: "c1",
      label: "child",
    });
  });

  it("hasRelations should be false for empty arrays", () => {
    const parent = new ParentEntity("p1", "parent");
    parent.setRelations("tags", []);

    expect(parent.hasRelations("tags")).toBe(false);
    expect(parent.getRelationCount("tags")).toBe(0);
  });

  it("removeFromRelation should remove matching item and return true", () => {
    const parent = new ParentEntity("p1", "parent");
    parent.setRelations("tags", [
      new TagEntity("t1", "one"),
      new TagEntity("t2", "two"),
    ]);

    const removed = parent.removeFromRelation("tags", (tag) => {
      return tag.toJSON().id === "t1";
    });

    expect(removed).toBe(true);
    expect(parent.getRelationCount("tags")).toBe(1);
    expect(parent.getRelationAt("tags", 0)?.toJSON().id).toBe("t2");
  });

  it("removeFromRelation should return false when key is not an array relation value", () => {
    const parent = new ParentEntity("p1", "parent");

    const removed = parent.removeFromRelation("tags", () => true);

    expect(removed).toBe(false);
  });

  it("JSONRelations should serialize nested entities recursively", () => {
    const child = new ChildEntity("c1", "child");
    child.addToRelation("tags", new TagEntity("ct1", "child-tag"));

    const parent = new ParentEntity("p1", "parent");
    parent.setRelation("child", child);
    parent.addToRelation("tags", new TagEntity("pt1", "parent-tag"));

    expect(parent.JSONRelations()).toEqual({
      child: {
        id: "c1",
        label: "child",
        tags: [{ id: "ct1", name: "child-tag" }],
      },
      tags: [{ id: "pt1", name: "parent-tag" }],
    });
  });

  it("toJSONWithRelations should include all relations when no options are provided", () => {
    const parent = new ParentEntity("p1", "parent");
    parent.setRelation("child", new ChildEntity("c1", "child"));
    parent.addToRelation("tags", new TagEntity("t1", "one"));

    expect(parent.toJSONWithRelations()).toEqual({
      id: "p1",
      title: "parent",
      child: { id: "c1", label: "child" },
      tags: [{ id: "t1", name: "one" }],
    });
  });

  it("toJSONWithRelations should filter relations based on options", () => {
    const parent = new ParentEntity("p1", "parent");
    parent.setRelation("child", new ChildEntity("c1", "child"));
    parent.addToRelation("tags", new TagEntity("t1", "one"));

    expect(parent.toJSONWithRelations({ child: true })).toEqual({
      id: "p1",
      title: "parent",
      child: { id: "c1", label: "child" },
    });
  });

  it("removeRelations and clearRelations should clean stored relations", () => {
    const parent = new ParentEntity("p1", "parent");
    parent.setRelation("child", new ChildEntity("c1", "child"));
    parent.addToRelation("tags", new TagEntity("t1", "one"));

    expect(parent.getRelationKeys().sort()).toEqual(["child", "tags"]);

    parent.removeRelations("child");
    expect(parent.getRelationKeys()).toEqual(["tags"]);

    parent.clearRelations();
    expect(parent.getRelationKeys()).toEqual([]);
  });
});
