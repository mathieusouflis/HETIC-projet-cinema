import type { POSTAuthLogin200DataUser } from "@packages/api-sdk";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthStore = {
  user: POSTAuthLogin200DataUser | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: POSTAuthLogin200DataUser) => void;
  setAccessToken: (accessToken: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
};

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
