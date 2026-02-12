import {
  Calendar1,
  ListTodo,
  MessageSquare,
  Search,
  Telescope,
} from "lucide-react";
import { baseRoutes } from "@/lib/routes";

export const navConfig = {
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
    devices: {
      mobile: true,
      desktop: true,
    },
  },
  watchlist: {
    name: "Watchlist",
    path: baseRoutes.watchlist,
    icon: ListTodo,
    devices: {
      mobile: true,
      desktop: true,
    },
  },
};
