import { Star } from "lucide-react";

export function StarRating({ rating }: { rating: number | null }) {
  if (rating == null) return null;
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < filled
              ? "size-4 fill-yellow-400 text-yellow-400"
              : "size-4 text-yellow-400"
          }
        />
      ))}
    </div>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const filled = value != null && i < value;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(value === star ? null : star)}
            aria-label={`Rate ${star} out of 5`}
            className="p-0.5 hover:scale-110 transition-transform"
          >
            <Star
              className={
                filled
                  ? "size-5 fill-yellow-400 text-yellow-400"
                  : "size-5 text-yellow-400"
              }
            />
          </button>
        );
      })}
    </div>
  );
}
