"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Drawer({
  isOpen,
  width = "40rem",
  children,
}: {
  isOpen: boolean;
  width?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={() => router.back()}
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 h-full bg-white z-50 shadow-xl transition-transform"
        style={{ width }}
      >
        <div className="h-full overflow-y-auto">{children}</div>
      </aside>
    </>
  );
}
