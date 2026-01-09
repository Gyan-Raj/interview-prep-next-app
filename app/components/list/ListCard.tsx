import { PendingInviteRow, QuestionRow, SubmissionRow, UserRow } from "@/app/types";

// components/ListCard.tsx
export type ListCardItem =
  | { kind: "submission"; data: SubmissionRow }
  | { kind: "user"; data: UserRow }
  | { kind: "invite"; data: PendingInviteRow }
  | { kind: "question"; data: QuestionRow };

type ListCardProps<T extends ListCardItem> = {
  item: T;

  title: React.ReactNode;
  subtitle?: React.ReactNode;
  metaData?: React.ReactNode;

  badge?: React.ReactNode;
  actions?: React.ReactNode;

  onCardClick?: (item: T) => void;
};

export default function ListCard<T extends ListCardItem>({
  item,
  title,
  subtitle,
  metaData,
  badge,
  actions,
  onCardClick,
}: ListCardProps<T>) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-panel)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        className="relative flex items-start justify-between p-4 cursor-pointer hover:bg-muted"
        onClick={() => onCardClick?.(item)}
      >
        {badge && (
          <div className="absolute top-[-3.5] right-[-0.5]">{badge}</div>
        )}

        <div className="space-y-1 pr-24">
          <p className="font-medium">
            {title}
            {subtitle && (
              <span className="opacity-70 text-sm"> · {subtitle}</span>
            )}
          </p>

          {metaData && <p className="text-xs opacity-70">{metaData}</p>}
        </div>

        <div onClick={(e) => e.stopPropagation()}>{actions}</div>
      </div>
    </div>
  );
}
