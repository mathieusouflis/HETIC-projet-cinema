import { createFileRoute } from "@tanstack/react-router";
import { Login } from "@/features/auth";

export const Route = createFileRoute("/login/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Login />;
}
