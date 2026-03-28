import { describe, expect, it } from "vitest";
import { Watchlist } from "./watchlist.entity.js";

describe("Watchlist entity", () => {
  const baseRow = {
    id: "w1",
    userId: "u1",
    contentId: "c1",
    status: "plan_to_watch" as const,
    currentSeason: null as number | null,
    currentEpisode: null as number | null,
    addedAt: "2024-01-01T00:00:00.000Z",
    startedAt: null as string | null,
    completedAt: null as string | null,
  };

  it("normalise les dates et le rating", () => {
    const w = new Watchlist({
      ...baseRow,
      rating: "4.5",
      startedAt: "2024-02-01T00:00:00.000Z",
    });
    expect(w.addedAt).toBeInstanceOf(Date);
    expect(w.startedAt).toBeInstanceOf(Date);
    expect(w.rating).toBe(4.5);
  });

  it("applique le statut par defaut et rating null", () => {
    const w = new Watchlist({
      ...baseRow,
      status: undefined as never,
      rating: null,
    });
    expect(w.status).toBe("plan_to_watch");
    expect(w.rating).toBeNull();
  });

  it("detecte statuts et progression", () => {
    const plan = new Watchlist(baseRow);
    expect(plan.isToWatch()).toBe(true);
    expect(plan.isWatching()).toBe(false);
    expect(plan.hasProgress()).toBe(false);

    const watching = new Watchlist({ ...baseRow, status: "watching" });
    expect(watching.isWatching()).toBe(true);

    const done = new Watchlist({ ...baseRow, status: "completed" });
    expect(done.isCompleted()).toBe(true);

    const prog = new Watchlist({
      ...baseRow,
      currentSeason: 2,
      currentEpisode: 0,
    });
    expect(prog.hasProgress()).toBe(true);
  });

  it("toJSON expose les champs", () => {
    const w = new Watchlist(baseRow);
    const j = w.toJSON();
    expect(j.id).toBe("w1");
    expect(j.status).toBe("plan_to_watch");
    expect(j.rating).toBeNull();
  });
});
