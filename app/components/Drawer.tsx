"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { GripVertical } from "lucide-react";

type DrawerProps = {
  isOpen: boolean;
  defaultWidthPct?: number; // 60
  minWidthPct?: number; // 40
  maxWidthPct?: number; // 95
  children: ReactNode;
};

export default function Drawer({
  isOpen,
  defaultWidthPct = 60,
  minWidthPct = 20,
  maxWidthPct = 100,
  children,
}: DrawerProps) {
  const [widthPct, setWidthPct] = useState(defaultWidthPct);
  const isResizingRef = useRef(false);

  /* ---------------- Lock body scroll ---------------- */

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* ---------------- Resize handlers ---------------- */

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }

  function onMouseMove(e: MouseEvent) {
    if (!isResizingRef.current) return;

    const viewportWidth = window.innerWidth;

    // Distance from right edge → percentage
    const rawPct = ((viewportWidth - e.clientX) / viewportWidth) * 100;

    const clampedPct = Math.min(maxWidthPct, Math.max(minWidthPct, rawPct));

    setWidthPct(clampedPct);
  }

  function onMouseUp() {
    isResizingRef.current = false;
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  /* ---------------- Render ---------------- */

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      />

      {/* Drawer */}
      <aside
        className={`
          fixed right-0 top-0 z-50 h-full flex flex-col
          transform transition-transform duration-200 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{
          width: `${widthPct}vw`,
          backgroundColor: "var(--color-panel)",
          borderLeft: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Resize handle */}
        <div
          onMouseDown={onMouseDown}
          className="
            absolute left-0 top-0 h-full w-3
            cursor-col-resize
            flex items-center justify-center
            select-none
            group
          "
        >
          <div
            className="
              h-10 w-1 rounded-full
              bg-[var(--color-border)]
              group-hover:bg-[var(--color-hover)]
              transition-colors
            "
          />
          <GripVertical
            size={14}
            className="
              absolute
              text-[var(--color-text-muted)]
              opacity-0
              group-hover:opacity-100
              transition-opacity
            "
          />
        </div>

        {/* Content */}
        <div className="h-full overflow-hidden">{children}</div>
      </aside>
    </>
  );
}
