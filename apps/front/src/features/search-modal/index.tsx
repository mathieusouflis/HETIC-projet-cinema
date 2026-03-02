import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SearchInput } from "@/components/common/search-input";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogPrimitiveContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SearchResults } from "./search-results";

export const SearchProvider = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const navigate = useNavigate();

  // Debounce for live results inside the modal
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Cmd/Ctrl+K toggle
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSubmit = (value: string) => {
    setOpen(false);
    navigate({
      to: "/search",
      search: { title: value.trim() || undefined, page: 1, actorsPage: 1 },
    });
  };

  const handleClear = () => {
    setDebouncedQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitiveContent
          showCloseButton={false}
          className="flex-flex-col gap-2.5 bg-transparent border-0 outline-0 shadow-none p-0 md:max-w-3xl top-1/12 translate-y-0"
        >
          <SearchDialogContent className="relative p-0.5 rounded-4xl overflow-visible">
            <SearchInput
              id="search-modal"
              value={query}
              onChange={setQuery}
              onSubmit={handleSubmit}
              onClear={handleClear}
              placeholder="Search..."
              autoFocus
              inputClassName="py-6 pl-11.5 pr-9 rounded-4xl"
              iconWrapperClassName="left-4 top-1/2 -translate-y-1/2"
              iconClassName="size-5.5 stroke-accent-foreground"
            />
          </SearchDialogContent>
          <SearchDialogContent className="max-h-[50vh]">
            <ScrollArea className="h-full">
              <SearchResults
                onClick={() => setOpen((old) => !old)}
                query={debouncedQuery}
              />
            </ScrollArea>
          </SearchDialogContent>
        </DialogPrimitiveContent>
      </DialogPortal>
    </Dialog>
  );
};

function SearchDialogContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-background rounded-3xl border p-6 shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}
