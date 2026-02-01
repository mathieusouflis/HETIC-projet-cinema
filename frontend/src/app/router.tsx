import { createBrowserRouter } from "react-router-dom";
import LoginPage from "@/routes/_auth/login";
import RegisterPage from "@/routes/_auth/register";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
]);