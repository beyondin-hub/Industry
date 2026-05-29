export default function CatalogoLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-md bg-ink-100" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-md bg-ink-100" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="hidden h-96 animate-pulse rounded-xl bg-ink-100 lg:block" />
        <div>
          <div className="mb-4 h-14 animate-pulse rounded-xl bg-ink-100" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border bg-card">
                <div className="h-36 animate-pulse bg-ink-100" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-24 animate-pulse rounded bg-ink-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-ink-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-ink-100" />
                  <div className="mt-3 h-8 w-28 animate-pulse rounded bg-ink-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
