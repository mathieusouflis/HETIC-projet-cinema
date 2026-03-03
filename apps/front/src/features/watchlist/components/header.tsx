export function TableHeader() {
  return (
    <div className="text-muted-foreground mb-2 hidden items-center px-3 p-2 rounded-lg bg-neutral-100 text-sm font-medium sm:flex">
      <span className="w-8 shrink-0">#ID</span>
      <span className="ml-3 w-14 shrink-0" />
      <span className="ml-3 flex-1" />
      <span className="w-14 shrink-0 text-center">Progress</span>
      <span className="ml-4 w-24 shrink-0 text-center">Rating</span>
      <span className="ml-7 w-8 shrink-0" />
    </div>
  );
}
