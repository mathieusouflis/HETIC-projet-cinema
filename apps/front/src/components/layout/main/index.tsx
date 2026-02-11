import { Outlet } from "@tanstack/react-router";
import { AssideNav } from "./asside-nav";
import { MainProviders } from "./asside-nav/providers";

export const MainLayout = () => {
  return (
    <MainProviders>
      <div className="flex flex-row-reverse min-h-screen">
        <main className="w-full">
          <Outlet />
        </main>
        <AssideNav />
      </div>
    </MainProviders>
  );
};
