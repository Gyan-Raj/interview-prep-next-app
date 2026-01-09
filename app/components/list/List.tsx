// components/List.tsx

import ListCard, { ListCardItem } from "./ListCard";

export default function List<T extends ListCardItem>({
  items,
  getTitle,
  getSubtitle,
  getMetaData,
  getBadge,
  getActions,
  onItemClick,
}: {
  items: T[];

  getTitle: (item: T) => React.ReactNode;
  getSubtitle?: (item: T) => React.ReactNode;
  getMetaData?: (item: T) => React.ReactNode;

  getBadge?: (item: T) => React.ReactNode;
  getActions?: (item: T) => React.ReactNode;

  onItemClick?: (item: T) => void;
  }) {
  console.log(items,"items:List");
  
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ListCard<T>
          key={
            item.kind === "submission"
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
