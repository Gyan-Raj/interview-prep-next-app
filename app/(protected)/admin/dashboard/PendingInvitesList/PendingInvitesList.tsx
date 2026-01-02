import EntityList from "@/app/components/EntityList";
import InviteActionsMenu from "./InviteActionsMenu";
import { PendingInviteRow } from "@/app/types";
import { toSentenceCase } from "@/app/utils/utils";

export default function PendingInvitesList({
  invites,
  onConfirm,
}: {
  invites: PendingInviteRow[];
  onConfirm: (u: PendingInviteRow) => void;
}) {
  return (
    <EntityList
      items={invites.map((i) => ({
        id: i.inviteId,
        name: i.name,
        email: i.email,
        phone: i.phone,
      }))}
      renderMeta={(item) => {
        const invite = invites.find((i) => i.inviteId === item.id)!;
        if (!invite || invite.roles?.length === 0) return null;
        return `(${invite.roles
          .map((r) => toSentenceCase(r.name))
          .join(", ")})`;
      }}
      renderActions={(item) => {
        const invite = invites.find((i) => i.inviteId === item.id)!;
        return <InviteActionsMenu onConfirm={() => onConfirm(invite)} />;
      }}
    />
  );
}
