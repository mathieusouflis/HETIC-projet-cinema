import { Link, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NavLink = ({
  startIcon: StartIcon,
  href,
  variant = "desktop",
  children,
}: {
  startIcon: LucideIcon;
  href: string;
  variant?: "mobile" | "desktop";
  children: React.ReactNode;
}) => {
  const { pathname } = useLocation();
  const pathnameMatch =
    pathname === "/" ? pathname === href : href.startsWith(pathname);

  return (
    <Link to={href} className="w-fit">
      <Button
        variant={pathnameMatch ? "default" : "ghost"}
        size={variant === "mobile" ? "xl" : "2xl"}
      >
        {pathnameMatch ? <StartIcon fill="currentColor" /> : <StartIcon />}
        {variant === "desktop" && children}
      </Button>
    </Link>
  );
};
