import { FilterConfig } from "@/app/types";

type Props = {
  filter: FilterConfig;
};

export default function FilterOptionsPanel({ filter }: Props) {
  const { label, options, selected, isAllSelected, onToggle, onSelectAll } =
    filter;
  const sortedOptions = [...options].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div
      className="w-48 max-h-32 py-1 px-3 space-y-2 overflow-y-auto"
      style={{
        backgroundColor: "var(--color-panel)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* All */}
      {sortedOptions.length > 0 ? (
        <label
          className={`flex items-center gap-2 text-xs font-medium py-1.5 ${
            sortedOptions.length > 0 ? "border-b" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={isAllSelected}
            disabled={isAllSelected}
            onChange={onSelectAll}
          />
          <span>All {label}</span>
        </label>
      ) : (
        <span
          className={`flex items-center gap-2 text-xs ${
            sortedOptions.length > 0 ? "border-b" : ""
          }`}
        >
          No {label.toLowerCase()} to select
        </span>
      )}

      {/* <hr style={{ borderColor: "var(--color-border)" }} /> */}

      {sortedOptions.map((opt) => {
        const isOnlyOneSelected =
          selected.length === 1 && selected[0] === opt.id;

        return (
          <label
            key={opt.id}
            className="max-w-fit cursor-pointer flex items-center gap-2 text-sm"
            style={{ opacity: isAllSelected ? 0.5 : 1 }}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.id)}
              disabled={isOnlyOneSelected}
              onChange={() => onToggle(opt.id)}
            />
            {opt.name}
          </label>
        );
      })}
    </div>
  );
}
