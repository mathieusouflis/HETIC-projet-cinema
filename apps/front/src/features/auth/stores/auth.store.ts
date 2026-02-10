import type { POSTAuthLogin200DataUser } from "@packages/api-sdk";
import { create } from "zustand";

type AuthStore = {
  user: POSTAuthLogin200DataUser | null;
  accessToken: string | null;
  setUser: (user: POSTAuthLogin200DataUser) => void;
  setAccessToken: (accessToken: string) => void;
  clear: () => void;
};

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  setUser: (user) => set(() => ({ user })),
  setAccessToken: (accessToken) => set(() => ({ accessToken })),
  clear: () => {
    set(() => ({ user: null, accessToken: null }));
  },
}));
