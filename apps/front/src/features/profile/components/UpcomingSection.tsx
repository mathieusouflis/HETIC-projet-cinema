export function UpcomingSection() {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-3">Upcoming Releases</h3>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span>Dune Part 2</span>
          <span className="text-muted-foreground">12 Mar</span>
        </div>

        <div className="flex justify-between">
          <span>The Boys S4</span>
          <span className="text-muted-foreground">02 Apr</span>
        </div>
      </div>
    </div>
  );
}
