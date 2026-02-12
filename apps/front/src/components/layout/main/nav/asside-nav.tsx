import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/stores/auth.store";
import { useRoutes } from "@/lib/routes";
import { navConfig } from "./common";
import { NavLink } from "./components/nav-link";

export const AssideNav = () => {
  const routes = useRoutes();
  const { user } = useAuth();

  return (
    <aside className=" hidden lg:block h-auto">
      <div className="sticky top-0 h-screen pl-5 pt-5 pb-8 w-60 flex flex-col">
        <div className="flex flex-col gap-9">
          <h1 className="text-2xl pl-4">Kirona</h1>
          <ul className="flex flex-col gap-1.5">
            {Object.values(navConfig).map((v, idx) => {
              return v.requireAuth && !user ? null : (
                <li key={idx}>
                  <NavLink href={v.path} startIcon={v.icon}>
                    {v.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-3 h-full justify-end items-center w-fit pl-4">
          {!user && (
            <Link to={routes.login} className="w-full">
              <Button size={"2xl"} color="blue" className="w-full font-bold">
                Login
              </Button>
            </Link>
          )}
          {user && (
            <>
              <Button variant={"ghost"} size={"icon-2xl"}>
                <Bell />
              </Button>
              <Link to={routes.profile}>
                <Avatar size="2xl">
                  {user?.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt="Avatar" />
                  ) : (
                    <span className="w-full h-full bg-neutral-400" />
                  )}
                </Avatar>
              </Link>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
