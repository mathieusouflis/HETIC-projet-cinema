import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Monitor, Moon, Settings, Sun, User2 } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/stores/auth.store";
import { useThemeStore } from "@/features/theme/stores/theme.store";
import { queryClient } from "@/lib/api/client";
import { getApi } from "@/lib/api/services";
import { baseRoutes, useRoutes } from "@/lib/routes";
import { navConfig } from "./common";
import { NavLink } from "./components/nav-link";

export const BottomNav = () => {
  const { user, clear } = useAuth();
  const { setTheme } = useThemeStore();
  const routes = useRoutes();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await getApi().auth.logout();
    } catch {}
    queryClient.clear();
    clear();
    navigate({ to: "/login", replace: true });
  };

  return (
    <>
      <span className="h-15 p-2" />
      <nav className="block fixed bottom-0 p-2 lg:hidden w-full bg-white dark:bg-background border-t">
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
          {user && (
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar size="lg" className="mx-5">
                    {user?.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt="Avatar" />
                    ) : (
                      <span className="w-full h-full bg-neutral-400" />
                    )}
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-muted-foreground">
                      {user.username}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link to={routes.profile}>
                      <DropdownMenuItem>
                        <User2 />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Sun className="h-4 w-4 dark:hidden" />
                        <Moon className="hidden h-4 w-4 dark:block" />
                        <span>Theme</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Light</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon className="mr-2 h-4 w-4" />
                            <span>Dark</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("system")}>
                            <Monitor className="mr-2 h-4 w-4" />
                            <span>System</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <Link to={routes.settings}>
                      <DropdownMenuItem>
                        <Settings />
                        Settings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
};
