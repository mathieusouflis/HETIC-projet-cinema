import { Outlet } from "@tanstack/react-router";
import { SearchProvider } from "@/features/search-modal";
import { AssideNav } from "./asside-nav";

export const MainLayout = () => {
  return (
    <div className="flex flex-row-reverse min-h-screen overflow-hidden">
      <main className="flex-1 mt-5 mr-5 overflow-hidden">
        <Outlet />
      </main>
      <AssideNav />
      <SearchProvider />
    </div>
  );
};
