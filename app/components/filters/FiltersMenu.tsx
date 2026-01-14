"use client";

import { useRef, useState } from "react";
import { ChevronLeft, Filter } from "lucide-react";
import { useOutsideClick } from "@/app/hooks/hooks";
import FilterOptionsPanel from "./FilterOptionsPanel";
import { FilterConfig } from "@/app/types";
type Props = {
  filters: FilterConfig[];
};

export default function FiltersMenu({ filters }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useOutsideClick(containerRef, open, () => {
    setOpen(false);
    setActiveKey(null);
  });

  const activeFilter = filters.find((f) => f.key === activeKey);

  return (
    <div ref={containerRef} className="relative">
      {/* Main Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2 text-sm flex items-center gap-1"
        style={{
          backgroundColor: "var(--color-panel)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          color: "var(--color-text)",
        }}
      >
        <Filter size={14} style={{ opacity: 0.7 }} />
        Filters
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 flex z-30"
          style={{
            backgroundColor: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {activeFilter && (
            <div className="p-2">
              <FilterOptionsPanel filter={activeFilter} />
            </div>
          )}
          {/* LEFT: Filter Categories */}
          <div className="w-36 p-2 overflow-y-auto" style={{ maxHeight: 320 }}>
            {filters.map((filter) => (
              <div
                key={filter.key}
                onMouseEnter={() => setActiveKey(filter.key)}
                className={`px-2 py-2 text-xs cursor-pointer flex items-center justify-between ${
                  activeKey === filter.key ? "bg-(--color-accent)" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <ChevronLeft size={12} style={{ opacity: 0.6 }} />
                  <span>{filter.label}</span>
                </div>

                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: "var(--color-muted)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {activeFilter?.selected?.length}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
