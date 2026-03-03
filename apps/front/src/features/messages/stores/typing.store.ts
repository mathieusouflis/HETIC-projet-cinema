import { create } from "zustand";

interface TypingState {
  typingByConversation: Record<string, string[]>;
  addTypingUser: (conversationId: string, userId: string) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingByConversation: {},

  addTypingUser: (conversationId, userId) =>
    set((state) => {
      const existing = state.typingByConversation[conversationId] ?? [];
      if (existing.includes(userId)) return state;
      return {
        typingByConversation: {
          ...state.typingByConversation,
          [conversationId]: [...existing, userId],
        },
      };
    }),

  removeTypingUser: (conversationId, userId) =>
    set((state) => {
      const existing = state.typingByConversation[conversationId] ?? [];
      return {
        typingByConversation: {
          ...state.typingByConversation,
          [conversationId]: existing.filter((id) => id !== userId),
        },
      };
    }),
}));
