export function WatchpartySection() {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-3">Upcoming Watchpartys</h3>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span>Breaking Bad Rewatch</span>
          <span className="text-muted-foreground">Tonight</span>
        </div>

        <div className="flex justify-between">
          <span>Marvel Marathon</span>
          <span className="text-muted-foreground">Friday</span>
        </div>
      </div>
    </div>
  );
}
