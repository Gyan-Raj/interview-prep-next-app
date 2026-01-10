"use client";

import { ReactNode, useEffect } from "react";

export default function Drawer({
  isOpen,
  width = "480px",
  children,
}: {
  isOpen: boolean;
  width?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay (visual only) */}
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
          width,
          backgroundColor: "var(--color-panel)",
          borderLeft: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {children}
      </aside>
    </>
  );
}
