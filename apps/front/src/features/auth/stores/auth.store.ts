import { create } from "zustand";

type AuthStore = {
  user: any | null;
  accessToken: string | null;
  setUser: (user: any) => void;
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
