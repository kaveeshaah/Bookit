export default function Loading() {
  return (
    <div>
      <div className="skeleton mb-2 h-8 w-48" />
      <div className="skeleton mb-8 h-4 w-72" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="skeleton mt-8 h-64 rounded-2xl" />
    </div>
  );
}
