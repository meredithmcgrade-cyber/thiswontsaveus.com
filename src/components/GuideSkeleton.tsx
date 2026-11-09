export function GuideSkeleton() {
  return (
    <div className="animate-pulse pt-16" aria-hidden>
      <div className="h-7 w-56 rounded-full bg-surface-2" />
      <div className="mt-6 h-20 w-3/4 rounded-xl bg-surface-2" />
      <div className="mt-5 h-6 w-1/2 rounded-full bg-surface-2" />
      <div className="mt-16 flex flex-col gap-3">
        <div className="h-24 rounded-2xl bg-surface-2" />
        <div className="h-24 rounded-2xl bg-surface-2" />
        <div className="h-24 rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}
