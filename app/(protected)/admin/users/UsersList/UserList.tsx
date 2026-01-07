import { toSentenceCase } from "@/app/utils/utils";
import UserActionsMenu from "./UserActionsMenu";
import EntityList from "@/app/components/EntityList";
import { UserRow } from "@/app/types";

export default function UsersList({
  users,
  onEdit,
  onDelete,
}: {
  users: UserRow[];
  onEdit: (u: UserRow) => void;
  onDelete: (u: UserRow) => void;
}) {
  if (users.length === 0) {
    return <div className="p-6 text-sm opacity-70">No users found.</div>;
  }
  return (
    <EntityList
      items={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
      }))}
      renderMeta={(item) => {
        const user = users.find((u) => u.id === item.id);
        if (!user || user.roles.length === 0) return null;
        return `(${user.roles.map((r) => toSentenceCase(r.name)).join(", ")})`;
      }}
      renderActions={(item) => {
        const user = users.find((u) => u.id === item.id)!;
        return (
          <UserActionsMenu
            onEdit={() => onEdit(user)}
            onDelete={() => onDelete(user)}
            user={user}
          />
        );
      }}
    />
  );
}
