import { describe, expect, it } from "vitest";
import { Watchparty } from "./watchparty.entity.js";

describe("Watchparty entity", () => {
  const baseRow = {
    id: "wp1",
    createdBy: "u1",
    contentId: "c1",
    seasonId: null as string | null,
    episodeId: null as string | null,
    name: "Soirée",
    description: null as string | null,
    isPublic: true,
    maxParticipants: 10 as number | null,
    platformId: "pl1",
    platformUrl: "https://watch.test",
    scheduledAt: "2024-06-01T20:00:00.000Z",
    startedAt: null as string | null,
    endedAt: null as string | null,
    status: "scheduled" as const,
    currentPositionTimestamp: 0,
    isPlaying: false,
    leaderUserId: "u1" as string | null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  };

  it("normalise les dates et le statut par defaut", () => {
    const w = new Watchparty(baseRow);
    expect(w.scheduledAt).toBeInstanceOf(Date);
    expect(w.createdAt).toBeInstanceOf(Date);
    expect(w.status).toBe("scheduled");
  });

  it("detecte les etats et roles", () => {
    const scheduled = new Watchparty(baseRow);
    expect(scheduled.isScheduled()).toBe(true);
    expect(scheduled.hasStarted()).toBe(false);
    expect(scheduled.isCreator("u1")).toBe(true);
    expect(scheduled.isLeader("u1")).toBe(true);
    expect(scheduled.isFull(5)).toBe(false);
    expect(scheduled.isFull(10)).toBe(true);
    expect(scheduled.isFull(11)).toBe(true);

    const active = new Watchparty({ ...baseRow, status: "active" });
    expect(active.isActive()).toBe(true);

    const ended = new Watchparty({ ...baseRow, status: "ended" });
    expect(ended.hasEnded()).toBe(true);

    const cancelled = new Watchparty({ ...baseRow, status: "cancelled" });
    expect(cancelled.isCancelled()).toBe(true);

    const started = new Watchparty({
      ...baseRow,
      startedAt: "2024-06-01T21:00:00.000Z",
    });
    expect(started.hasStarted()).toBe(true);
  });

  it("isFull retourne false sans plafond", () => {
    const w = new Watchparty({ ...baseRow, maxParticipants: null });
    expect(w.isFull(999)).toBe(false);
  });

  it("toJSON serialise les champs", () => {
    const w = new Watchparty(baseRow);
    const j = w.toJSON();
    expect(j.id).toBe("wp1");
    expect(j.name).toBe("Soirée");
    expect(j.status).toBe("scheduled");
  });
});
