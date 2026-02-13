import type { POSTAuthLogin200 } from "@packages/api-sdk";
import type { POSTAuthLogin200DataUser } from "@packages/api-sdk";
import { create } from "zustand";

type User = POSTAuthLogin200["data"]["user"];

type AuthStore = {
  user: User | null;
  accessToken: string | null;

  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  clear: () => void;
};

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,

  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),

  clear: () =>
    set({
      user: null,
      accessToken: null,
    }),
}));
