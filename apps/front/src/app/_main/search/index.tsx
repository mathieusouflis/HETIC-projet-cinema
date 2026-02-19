import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "@/features/search-page";

export const Route = createFileRoute("/_main/search/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: typeof search.q === "string" ? search.q : "",
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <SearchPage
      initialQuery={q}
      onQueryChange={(next) => {
        navigate({
          search: (prev) => ({
            ...prev,
            q: next.trim() || "",
          }),
          replace: true,
        });
      }}
    />
  );
}
