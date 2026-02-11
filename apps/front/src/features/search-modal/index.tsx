import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogPrimitiveContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SearchResults } from "./search-results";

export const SearchProvider = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitiveContent
          showCloseButton={false}
          className="flex-flex-col gap-2.5 bg-transparent border-0 outline-0 shadow-none p-0 md:max-w-3xl top-1/12 translate-y-0"
        >
          <SearchDialogContent className="relative p-0.5 rounded-4xl overflow-visible">
            <Input
              type="text"
              id="search"
              placeholder="Search..."
              className="py-6 pr-6 pl-11.5 rounded-4xl"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
            <label
              htmlFor="search"
              className="absolute top-1/2 left-4 -translate-y-1/2"
            >
              <Search className=" size-5.5 stroke-accent-foreground" />
            </label>
          </SearchDialogContent>
          <SearchDialogContent className="max-h-[50vh]">
            <ScrollArea className="h-full">
              <SearchResults query={debouncedQuery} />
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
