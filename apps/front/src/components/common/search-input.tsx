import { Search, X } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Called when Enter is pressed. */
  onSubmit?: (value: string) => void;
  /** Extra side-effect when the user clears (X button). */
  onClear?: () => void;
  placeholder?: string;
  id?: string;
  autoFocus?: boolean;
  /** Outer wrapper div className. */
  className?: string;
  /** Merged onto the <input> element (twMerge, so Tailwind conflicts resolve). */
  inputClassName?: string;
  /** Label element wrapping the icon. */
  iconWrapperClassName?: string;
  /** Search SVG className. */
  iconClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Search…",
  id = "search-input",
  autoFocus,
  className,
  inputClassName,
  iconWrapperClassName,
  iconClassName,
}: SearchInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.(value);
    }
  };

  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <label
        htmlFor={id}
        className={cn(
          "absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none",
          iconWrapperClassName
        )}
      >
        <Search
          className={cn("size-4 stroke-muted-foreground", iconClassName)}
        />
      </label>

      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn("pl-10 pr-4", value && "pr-9", inputClassName)}
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
