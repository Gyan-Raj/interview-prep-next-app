import List from "@/app/components/list/List";
import { PendingInviteRow } from "@/app/types";
import { toSentenceCase } from "@/app/utils/utils";

export default function UserInvitesList({
  invites,
  renderActions,
  emptyMessage = "No pending invites.",
}: {
  invites: PendingInviteRow[];
  renderActions: (invite: PendingInviteRow) => React.ReactNode;
  emptyMessage?: string;
}) {
  if (invites.length === 0) {
    return <div className="p-6 text-sm opacity-70">{emptyMessage}</div>;
  }

  return (
    <List
      items={invites.map((invite) => ({
        kind: "invite" as const,
        data: invite,
      }))}
      getTitle={(item) => item.data.name ?? "—"}
      getSubtitle={(item) => item.data.email}
      getMetaData={(item) =>
        item.data.roles.length > 0
          ? item.data.roles.map((r) => toSentenceCase(r.name)).join(", ")
          : null
      }
      getActions={(item) => renderActions(item.data)}
    />
  );
}
