export function ListCardSkeleton() {
  return (
    <div
      style={{
        backgroundColor: "var(--color-panel)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-4 w-2/3 rounded bg-(--color-border) animate-pulse" />

        {/* Subtitle */}
        <div className="h-3 w-1/3 rounded bg-(--color-border) animate-pulse" />

        {/* Metadata */}
        <div className="h-3 w-1/2 rounded bg-(--color-border) animate-pulse" />
      </div>
    </div>
  );
}
