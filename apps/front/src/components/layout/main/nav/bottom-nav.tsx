import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/stores/auth.store";
import { baseRoutes } from "@/lib/routes";
import { navConfig } from "./common";
import { NavLink } from "./components/nav-link";

export const BottomNav = () => {
  const { user } = useAuth();
  return (
    <>
      <span className="h-15 p-2" />
      <nav className="block fixed bottom-0 p-2 lg:hidden w-full bg-white">
        <ul className="flex flex-row justify-center">
          {Object.values(navConfig).map((v, idx) => {
            return v.requireAuth && !user ? null : (
              <li key={idx}>
                <NavLink href={v.path} variant="mobile" startIcon={v.icon}>
                  {v.name}
                </NavLink>
              </li>
            );
          })}
          {!user && (
            <li>
              <Link to={baseRoutes.login} className="w-full">
                <Button
                  size={"2xl"}
                  variant={"default"}
                  color="blue"
                  className="w-full font-bold"
                >
                  Login
                </Button>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
};
