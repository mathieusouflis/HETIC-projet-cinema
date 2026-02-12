import { navConfig } from "./common";
import { NavLink } from "./components/nav-link";

export const BottomNav = () => {
  return (
    <nav className="block fixed bottom-0 p-2 lg:hidden w-full bg-white">
      <ul className="flex flex-row justify-center">
        {Object.values(navConfig).map((v, idx) => (
          <li key={idx}>
            <NavLink href={v.path} variant="mobile" startIcon={v.icon}>
              {v.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
