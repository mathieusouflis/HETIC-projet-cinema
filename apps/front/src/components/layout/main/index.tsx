import { Outlet } from "@tanstack/react-router";
import { SearchProvider } from "@/features/search-modal";
import { AssideNav } from "./nav/asside-nav";
import { BottomNav } from "./nav/bottom-nav";

export const MainLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row-reverse h-screen gap-6">
      <main className="flex flex-1 py-5 px-5 pb-[65px] min-h-screen lg:ml-0 overflow-x-hidden overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
      <AssideNav />
      <SearchProvider />
    </div>
  );
};
