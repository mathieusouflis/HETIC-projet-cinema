import { Link } from "@tanstack/react-router";
import {
  Bell,
  Calendar1,
  ListTodo,
  MessageSquare,
  Search,
  Telescope,
} from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/stores/auth.store";
import { useRoutes } from "@/lib/routes";
import { NavLink } from "./components/nav-link";

export const AssideNav = () => {
  const routes = useRoutes();
  const { user } = useAuth();

  const avatar =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s";

  return (
    <aside className="pl-5 pt-5 pb-8  w-2xs flex flex-col">
      <div className="flex flex-col gap-9">
        <h1 className="text-2xl pl-4">Kirona</h1>
        <ul className="flex flex-col gap-1.5">
          <li>
            <NavLink href={routes.home} startIcon={Telescope}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink href={routes.search.root} startIcon={Search}>
              Search
            </NavLink>
          </li>
          <li>
            <NavLink href={routes.calendar} startIcon={Calendar1}>
              Calendar
            </NavLink>
          </li>
          <li>
            <NavLink href={routes.messages} startIcon={MessageSquare}>
              Messages
            </NavLink>
          </li>
          <li>
            <NavLink href={routes.watchlist} startIcon={ListTodo}>
              My watchlist
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-3 h-full justify-end items-center w-fit pl-4">
        <Button variant={"ghost"} size={"icon-2xl"}>
          <Bell />
        </Button>
        <Link to={routes.profile}>
          <Avatar size="2xl">
            <AvatarImage src={user?.avatarUrl ?? avatar} alt="Avatar" />
          </Avatar>
        </Link>
      </div>
    </aside>
  );
};
