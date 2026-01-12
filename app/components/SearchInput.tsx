"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search",
}: Props) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 min-w-0 max-w-md px-3 py-2 text-sm outline-none"
      style={{
        backgroundColor: "var(--color-panel)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        color: "var(--color-text)",
      }}
    />
  );
}
