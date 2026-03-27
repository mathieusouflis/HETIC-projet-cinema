import { beforeEach, describe, expect, it } from "vitest";
import { useTypingStore } from "./typing.store";

describe("useTypingStore", () => {
  beforeEach(() => {
    useTypingStore.setState({ typingByConversation: {} });
  });

  it("adds typing users once and removes them", () => {
    useTypingStore.getState().addTypingUser("conv-1", "u1");
    useTypingStore.getState().addTypingUser("conv-1", "u1");
    useTypingStore.getState().addTypingUser("conv-1", "u2");

    expect(useTypingStore.getState().typingByConversation["conv-1"]).toEqual([
      "u1",
      "u2",
    ]);

    useTypingStore.getState().removeTypingUser("conv-1", "u1");
    expect(useTypingStore.getState().typingByConversation["conv-1"]).toEqual([
      "u2",
    ]);
  });
});
