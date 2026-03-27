// @ts-nocheck
import { describe, expect, it } from "vitest";
import { Friendship } from "./friendship.entity.js";

describe("Friendship entity", () => {
  const baseRow = {
    id: "f1",
    userId: "u1",
    friendId: "u2",
    status: "pending",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  };

  it("detecte correctement les etats", () => {
    const pending = new Friendship(baseRow);
    const accepted = new Friendship({ ...baseRow, status: "accepted" });
    const rejected = new Friendship({ ...baseRow, status: "rejected" });

    expect(pending.isPending()).toBe(true);
    expect(accepted.isAccepted()).toBe(true);
    expect(rejected.isRejected()).toBe(true);
  });

  it("isParticipant valide userId et friendId", () => {
    const friendship = new Friendship(baseRow);

    expect(friendship.isParticipant("u1")).toBe(true);
    expect(friendship.isParticipant("u2")).toBe(true);
    expect(friendship.isParticipant("u3")).toBe(false);
  });

  it("toJSON retourne les proprietes attendues", () => {
    const friendship = new Friendship(baseRow);
    const json = friendship.toJSON();

    expect(json.id).toBe("f1");
    expect(json.status).toBe("pending");
    expect(json.createdAt).toBeInstanceOf(Date);
    expect(json.updatedAt).toBeInstanceOf(Date);
  });
});
