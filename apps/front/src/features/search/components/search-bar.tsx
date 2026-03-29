import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SearchInput } from "@/components/common/search-input";

interface SearchBarProps {
  defaultValue?: string;
  /** Extra search params to preserve (year, minRating, categories, etc.) */
  preservedParams?: Record<string, unknown>;
}

export function SearchBar({
  defaultValue = "",
  preservedParams,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const navigate = useNavigate();

  const submit = (value: string) => {
    navigate({
      to: "/search",
      search: {
        ...preservedParams,
        title: value.trim() || undefined,
        page: 1,
      },
    });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      submit(query);
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <SearchInput
      value={query}
      onChange={setQuery}
      onSubmit={submit}
      onClear={() => submit("")}
      placeholder="Search movies, shows, actors…"
      id="search-bar"
      inputClassName="rounded-full h-11 text-sm pl-10"
    />
  );
}
