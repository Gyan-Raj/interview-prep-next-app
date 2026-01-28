"use client";

import { Download } from "lucide-react";

type DownloadButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  hoverText?: string;
};

export default function DownloadButton({
  onClick,
  disabled = false,
  size = "md",
  className = "",
  hoverText = "Download",
}: DownloadButtonProps) {
  const sizeClasses = size === "sm" ? "h-8 w-8" : "h-9 w-9";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Download"
      className={`
        group relative inline-flex items-center justify-center
        ${sizeClasses}
        rounded-md
        border border-(--color-border)
        bg-(--color-panel)
        text-(--color-text-muted)
      hover:bg-gray-100
        hover:text-(--color-text)
        transition-colors
        disabled:opacity-50 disabled:pointer-events-none
        ${className}
      `}
    >
      {/* Icon only */}
      <Download className="h-4 w-4" />

      {/* Hover text */}
      <span
        className="
          pointer-events-none absolute bottom-full left-1/2
          -translate-x-1/2 mt-1
          whitespace-nowrap
          rounded
          bg-(--color-panel)
          border border-(--color-border)
          px-2 py-0.5
          text-xs
          text-(--color-text)
          shadow-md
          opacity-0
          group-hover:opacity-80
          transition-opacity
        "
      >
        {hoverText}
      </span>
    </button>
  );
}
