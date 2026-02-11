import { Link, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NavLink = ({
  startIcon: StartIcon,
  href,
  children,
}: {
  startIcon: LucideIcon;
  href: string;
  children: React.ReactNode;
}) => {
  const { pathname } = useLocation();
  const pathnameMatch =
    pathname === "/" ? pathname === href : href.startsWith(pathname);

  return (
    <Link to={href} className="w-fit">
      <Button variant={pathnameMatch ? "default" : "ghost"} size={"2xl"}>
        {pathnameMatch ? <StartIcon fill="currentColor" /> : <StartIcon />}
        {children}
      </Button>
    </Link>
  );
};
