import { Link, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NavLink = ({
  startIcon: StartIcon,
  href,
  variant = "desktop",
  matchPrefix = false,
  children,
}: {
  startIcon?: LucideIcon;
  href: string;
  variant?: "mobile" | "desktop";
  matchPrefix?: boolean;
  children: React.ReactNode;
}) => {
  const { pathname } = useLocation();
  const pathnameMatch = matchPrefix
    ? pathname.startsWith(href)
    : pathname === href;

  return (
    <Link to={href} className="w-fit">
      <Button
        variant={pathnameMatch ? "default" : "ghost"}
        size={variant === "mobile" ? "xl" : "2xl"}
      >
        {StartIcon &&
          (pathnameMatch ? <StartIcon fill="currentColor" /> : <StartIcon />)}
        {variant === "desktop" && children}
      </Button>
    </Link>
  );
};
