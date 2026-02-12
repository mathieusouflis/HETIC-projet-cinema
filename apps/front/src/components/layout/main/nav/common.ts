import {
  Calendar1,
  ListTodo,
  type LucideIcon,
  MessageSquare,
  Search,
  Telescope,
} from "lucide-react";
import { baseRoutes } from "@/lib/routes";

type NavConfig = Record<
  string,
  {
    name: string;
    path: string;
    icon: LucideIcon;
    devices: {
      mobile: boolean;
      desktop: boolean;
    };
    requireAuth?: boolean;
  }
>;

export const navConfig: NavConfig = {
  home: {
    name: "Home",
    path: baseRoutes.home,
    icon: Telescope,
    devices: {
      mobile: true,
      desktop: true,
    },
  },
  search: {
    name: "Search",
    path: baseRoutes.search.root,
    icon: Search,
    devices: {
      mobile: true,
      desktop: true,
    },
  },
  calendar: {
    name: "Calendar",
    path: baseRoutes.calendar,
    icon: Calendar1,
    devices: {
      mobile: true,
      desktop: true,
    },
  },
  messages: {
    name: "Messages",
    path: baseRoutes.messages,
    icon: MessageSquare,
    requireAuth: true,
    devices: {
      mobile: true,
      desktop: true,
    },
  },
  watchlist: {
    name: "Watchlist",
    path: baseRoutes.watchlist,
    icon: ListTodo,
    requireAuth: true,
    devices: {
      mobile: true,
      desktop: true,
    },
  },
};
