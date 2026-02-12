import type { POSTAuthLogin200 } from "@packages/api-sdk";
import type { POSTAuthLogin200DataUser } from "@packages/api-sdk";
import { create } from "zustand";

type User = POSTAuthLogin200["data"]["user"];

type AuthStore = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: POSTAuthLogin200DataUser) => void;
  setAccessToken: (accessToken: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
};

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
  setUser: (user) => set(() => ({ user })),
  setAccessToken: (accessToken) => set(() => ({ accessToken })),
  setLoading: (isLoading) => set(() => ({ isLoading })),
  setError: (error) => set(() => ({ error })),
  clear: () => {
    set(() => ({
      user: null,
      accessToken: null,
      isLoading: false,
      error: null,
    }));
  },
}));
