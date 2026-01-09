"use client";

import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/app/hooks/hooks";
import { Option, SearchSelectProps } from "@/app/types";

export default function SearchSelect({
  label,
  value,
  onChange,
  fetchOptions,
  allowCreate = false,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch options
  useEffect(() => {
    if (!open) return;

    setLoading(true);
    fetchOptions(debouncedQuery || undefined)
      .then(setOptions)
      .finally(() => setLoading(false));
  }, [open, debouncedQuery, fetchOptions]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="space-y-1">
      <label className="text-sm font-medium opacity-80">{label}</label>

      <div className="relative">
        <input
          value={open ? query : value?.name || ""}
          placeholder="Search…"
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm outline-none"
          style={{
            backgroundColor: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
          }}
        />

        {open && (
          <div
            className="absolute z-20 mt-1 w-full max-h-48 overflow-auto"
            style={{
              backgroundColor: "var(--color-panel)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {loading ? (
              <div className="p-2 text-sm opacity-60">Loading…</div>
            ) : (
              <>
                {options.map((opt) => (
                  <div
                    key={opt.id ?? opt.name}
                    className="px-3 py-2 text-sm cursor-pointer hover:opacity-80"
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    {opt.name}{" "}
                    <span>
                      {opt.email && opt.phone ? (
                        <span className="text-sm opacity-70">
                          {opt.email} / {opt.phone}
                        </span>
                      ) : (
                        ""
                      )}
                      {opt.email && !opt.phone ? (
                        <span className="text-sm opacity-70">
                          {opt.email ?? ""}
                        </span>
                      ) : (
                        ""
                      )}
                      {!opt.email && opt.phone ? (
                        <span className="text-sm opacity-70">
                          {opt.phone ?? ""}
                        </span>
                      ) : (
                        ""
                      )}
                    </span>
                  </div>
                ))}

                {allowCreate &&
                  query &&
                  !options.some(
                    (o) => o.name.toLowerCase() === query.toLowerCase()
                  ) && (
                    <div
                      className="px-3 py-2 text-sm cursor-pointer text-(--color-accent) hover:opacity-80"
                      onClick={() => {
                        onChange({ name: query });
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      Create “{query}”
                    </div>
                  )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
