import { SlidersHorizontal, X } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/lib/api/services";
import { cn } from "@/lib/utils";

export interface FilterValues {
  year?: number;
  minRating?: number;
  categories?: string[];
}

interface SearchFiltersProps {
  values: FilterValues;
  onApply: (values: FilterValues) => void;
}

export function SearchFilters({ values, onApply }: SearchFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterValues>(values);

  const services = useApi();
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    services.categories.list();
  const allCategories = categoriesData?.items ?? [];

  const activeCount =
    (values.year === undefined ? 0 : 1) +
    (values.minRating === undefined ? 0 : 1) +
    ((values.categories?.length ?? 0) > 0 ? 1 : 0);

  const applyNext = (next: FilterValues) => {
    setDraft(next);
    onApply(next);
  };

  const handleYearBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = raw ? parseInt(raw, 10) : undefined;
    applyNext({ ...draft, year: parsed });
  };

  const handleRatingClick = (r: number) => {
    applyNext({ ...draft, minRating: draft.minRating === r ? undefined : r });
  };

  const handleCategoryToggle = (catId: string) => {
    const current = draft.categories ?? [];
    const updated = current.includes(catId)
      ? current.filter((id) => id !== catId)
      : [...current, catId];
    applyNext({
      ...draft,
      categories: updated.length > 0 ? updated : undefined,
    });
  };

  const handleClear = () => applyNext({});

  const categoryName = (id: string) =>
    allCategories.find((c) => c.id === id)?.name ?? id;

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle row + active chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "rounded-full gap-1.5 transition-colors shrink-0",
            open &&
              "bg-foreground text-background dark:bg-foreground dark:hover:bg-foreground/90 border-foreground hover:bg-foreground/90 hover:text-background"
          )}
        >
          <SlidersHorizontal className="size-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full text-xs size-4 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>

        {values.year !== undefined && (
          <FilterChip
            label={`Year: ${values.year}`}
            onRemove={() => applyNext({ ...draft, year: undefined })}
          />
        )}
        {values.minRating !== undefined && (
          <FilterChip
            label={`Rating ≥ ${values.minRating}`}
            onRemove={() => applyNext({ ...draft, minRating: undefined })}
          />
        )}
        {(values.categories ?? []).map((id) => (
          <FilterChip
            key={id}
            label={categoryName(id)}
            onRemove={() =>
              applyNext({
                ...draft,
                categories:
                  (draft.categories ?? []).filter((c) => c !== id) || undefined,
              })
            }
          />
        ))}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <X className="size-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Panel */}
      {open && (
        <div className="flex flex-col gap-5 p-4 border rounded-2xl bg-muted/30">
          {/* Row 1: Year + Min rating side by side on md+ */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-5">
            {/* Year */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="filter-year"
                className="text-xs font-medium text-muted-foreground"
              >
                Year
              </label>
              <Input
                id="filter-year"
                type="number"
                min={1900}
                max={2100}
                placeholder="e.g. 2024"
                defaultValue={draft.year ?? ""}
                onBlur={handleYearBlur}
                className="w-32 h-8 rounded-full text-sm"
              />
            </div>

            {/* Min rating */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Min rating
              </span>
              <div className="flex gap-1 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => {
                  const active =
                    draft.minRating !== undefined && r <= draft.minRating;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRatingClick(r)}
                      className={cn(
                        "size-8 rounded-full text-xs font-medium border transition-colors",
                        active
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background border-border hover:border-foreground/50"
                      )}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Genres (full width) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Genre
            </span>
            {isCategoriesLoading ? (
              <div className="flex flex-wrap gap-1.5">
                {[...Array(8)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                  <Skeleton key={i} className="h-7 w-16 rounded-full" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {allCategories.map((cat) => {
                  const selected = (draft.categories ?? []).includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.id)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                        selected
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background border-border hover:border-foreground/50"
                      )}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-foreground transition-colors"
        aria-label={`Remove filter ${label}`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
