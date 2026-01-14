import List from "@/app/components/list/List";
import { UserRow } from "@/app/types";
import { toSentenceCase } from "@/app/utils/utils";
import React from "react";

export default function UsersList({
  users,
  renderActions,
  onItemClick,
  emptyMessage = "No users found.",
  isLoading = false,
}: {
  users: UserRow[];
  renderActions: (user: UserRow) => React.ReactNode;
  onItemClick?: (user: UserRow) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}) {
  if (!isLoading && users.length === 0) {
    return <div className="p-6 text-sm opacity-70">{emptyMessage}</div>;
  }

  return (
    <List
      items={users.map((u) => ({
        kind: "user" as const,
        data: u,
      }))}
      getTitle={(item) => {
        if (item.kind !== "user") return null;
        return item.data.name ?? "—";
      }}
      getSubtitle={(item) => {
        if (item.kind !== "user") return null;
        return item.data.email;
      }}
      getMetaData={(item) => {
        if (item.kind !== "user") return null;

        return item.data.roles.length > 0
          ? item.data.roles.map((r) => toSentenceCase(r.name)).join(", ")
          : null;
      }}
      getActions={(item) => {
        if (item.kind !== "user") return null;
        return renderActions(item.data);
      }}
      onItemClick={(item) => {
        if (item.kind === "user") {
          onItemClick?.(item.data);
        }
      }}
      loading={isLoading}
    />
  );
}
