import { Star } from "lucide-react";

export function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(rating / 2);
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
