import { Outlet } from "@tanstack/react-router";
import { SearchProvider } from "@/features/search-modal";
import { AssideNav } from "./asside-nav";

export const MainLayout = () => {
  return (
    <div className="flex flex-row-reverse min-h-screen">
      <main className="flex-1 my-5 mr-5 overflow-x-hidden overflow-y-auto">
        <Outlet />
      </main>
      <AssideNav />
      <SearchProvider />
    </div>
  );
};
