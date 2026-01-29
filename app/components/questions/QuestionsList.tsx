// app\components\questions\QuestionsList.tsx
import List from "@/app/components/list/List";
import { QuestionRow } from "@/app/types";
import { formatDisplayDate } from "@/app/utils/utils";

export default function QuestionsList({
  questions,
  renderActions,
  onItemClick,
  emptyMessage = "No questions found.",
  isLoading = true,
}: {
  questions: QuestionRow[];
  renderActions: (submission: QuestionRow) => React.ReactNode;
  onItemClick?: (submission: QuestionRow) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}) {
  if (!isLoading && questions.length === 0) {
    return <div className="p-6 text-sm opacity-70">{emptyMessage}</div>;
  }

  return (
    <List
      items={questions.map((q) => ({
        kind: "question" as const,
        data: q,
      }))}
      getTitle={(question) => question.data.text}
      getSubtitle={() => ""}
      getMetaData={(question) =>
        [
          question.data.interview.companyName,
          question.data.interview.role,
          question.data.interview.round,
          formatDisplayDate(question.data.interview.interviewDate),
        ]
          .filter(Boolean)
          .join(" · ")
      }
      onItemClick={(question) => onItemClick?.(question.data)}
      loading={isLoading}
    />
  );
}
