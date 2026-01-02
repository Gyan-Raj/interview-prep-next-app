"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type ModalProps = {
  title?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

export default function Modal({
  title,
  children,
  onClose,
  footer,
}: ModalProps) {
  // ESC to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-xl p-5"
        style={{
          backgroundColor: "var(--color-panel)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button onClick={onClose} className="opacity-70 hover:opacity-100">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">{children}</div>

        {/* Footer */}
        {footer && <div className="flex justify-end gap-3 mt-6">{footer}</div>}
      </div>
    </div>
  );
}
