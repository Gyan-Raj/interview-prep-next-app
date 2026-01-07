import React from "react";
import { SubmissionRow } from "../types";

// components/EntityList.tsx
export type SubmissionsEntryListItem = {
  id: string;
  companyName: string;
  role: string;
  round: string;
  interviewDate: string;
  resourceName: string;
  resourcePhone?: string;
  submission: SubmissionRow;
};

export default function SubmissionsEntryList({
  items,
  renderActions,
}: {
  items: SubmissionsEntryListItem[];
  renderActions: (item: SubmissionsEntryListItem) => React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-panel)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
      }}
      className="divide-y"
    >
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <p className="font-medium">
              {[item.companyName, item.round, item.role]
                .filter(Boolean)
                .join(" · ")}
            </p>

            <p className="text-sm opacity-70">
              {[item.interviewDate, item.resourceName, item.resourcePhone]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          {renderActions(item)}
        </div>
      ))}
    </div>
  );
}
