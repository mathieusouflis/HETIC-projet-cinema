import { SearchProvider } from "@/features/search-modal";

export const MainProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SearchProvider />
      {children}
    </>
  );
};
