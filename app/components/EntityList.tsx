// components/EntityList.tsx
export type EntityListItem = {
  id: string;
  name?: string;
  email: string;
  phone?: string;
};

export default function EntityList({
  items,
  renderActions,
  renderMeta,
}: {
  items: EntityListItem[];
  renderActions: (item: EntityListItem) => React.ReactNode;
  renderMeta?: (item: EntityListItem) => React.ReactNode;
}) {
  console.log(items, "items");

  return (
    <div
      style={{
        backgroundColor: "var(--color-panel)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
      }}
      className="divide-y"
    >
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <p className="font-medium">
              {item.name ?? "—"}
              {renderMeta && (
                <span className="text-sm opacity-65">
                  {" "}
                  - {renderMeta(item)}
                </span>
              )}
            </p>

            <p className="text-sm opacity-70">
              <span>{item.email ?? ""}</span>
              <span>{item.phone ? ` / ${item.phone}` : ""}</span>
            </p>
          </div>

          {renderActions(item)}
        </div>
      ))}
    </div>
  );
}
