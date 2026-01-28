import ListCard, { ListCardItem } from "@/app/components/list/ListCard";
import { ListCardSkeleton } from "@/app/components/list/ListCardSkeleton";

export default function List<T extends ListCardItem>({
  items,
  loading = false,
  skeletonCount = 5,

  getTitle,
  getSubtitle,
  getMetaData,
  getBadge,
  getActions,
  onItemClick,
}: {
  items: T[];
  loading?: boolean;
  skeletonCount?: number;

  getTitle: (item: T) => React.ReactNode;
  getSubtitle?: (item: T) => React.ReactNode;
  getMetaData?: (item: T) => React.ReactNode;

  getBadge?: (item: T) => React.ReactNode;
  getActions?: (item: T) => React.ReactNode;

  onItemClick?: (item: T) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ListCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ListCard<T>
          key={
            item.kind === "submission" || item.kind === "my-submission"
              ? item.data.submissionVersionId
              : item.data.id
          }
          item={item}
          title={getTitle(item)}
          subtitle={getSubtitle?.(item)}
          metaData={getMetaData?.(item)}
          badge={getBadge?.(item)}
          actions={getActions?.(item)}
          onCardClick={onItemClick}
        />
      ))}
    </div>
  );
}
