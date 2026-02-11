import { Outlet } from "@tanstack/react-router";
import { SearchProvider } from "@/features/search-modal";
import { AssideNav } from "./asside-nav";

export const MainLayout = () => {
  return (
    <div className="flex flex-row-reverse min-h-screen">
      <main className="w-full">
        <Outlet />
      </main>
      <AssideNav />
      <SearchProvider />
    </div>
  );
};
