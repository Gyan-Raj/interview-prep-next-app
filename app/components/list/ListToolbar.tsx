"use client";

import React from "react";

type Props = {
  left: React.ReactNode;
  right?: React.ReactNode;
};

export default function ListToolbar({ left, right }: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left side (search etc.) */}
      <div className="flex-1 min-w-0">{left}</div>

      {/* Right side (filters, buttons) */}
      {right && (
        <div className="flex items-center gap-4 flex-nowrap">{right}</div>
      )}
    </div>
  );
}
