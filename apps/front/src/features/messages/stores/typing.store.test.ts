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

  it("clears the last typing user leaving an empty array", () => {
    useTypingStore.getState().addTypingUser("conv-x", "u1");
    useTypingStore.getState().removeTypingUser("conv-x", "u1");
    expect(useTypingStore.getState().typingByConversation["conv-x"]).toEqual([]);
  });
});
