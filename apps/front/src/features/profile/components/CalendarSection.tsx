export function CalendarSection() {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-3">Calendar</h3>
      <div className="grid grid-cols-7 gap-2 text-center text-xs">
        {Array.from({ length: 28 }).map((_, i) => {
          const day = i + 1;

          return <div key={`day-${day}`}>{day}</div>;
        })}
      </div>
    </div>
  );
}
