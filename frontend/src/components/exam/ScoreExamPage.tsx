"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ComponentCard from "@/components/common/ComponentCard";
import ScoreExamAccordion from "@/components/exam/ScoreExamAccordion";
import { fetchExamAttempt } from "@/api/examAttempts";
import type { ExamAttemptPublic } from "@/client";

export default function ScoreExamPage() {
  const searchParams = useSearchParams();
  const examAttemptId = searchParams.get("attempt_id");

  const examQuery = useQuery<ExamAttemptPublic>({
    queryKey: ["examAttempt", examAttemptId],
    enabled: !!examAttemptId,
    queryFn: () => fetchExamAttempt(examAttemptId!),
  });

  if (!examAttemptId) {
    return <div>Missing exam context</div>;
  }

  if (examQuery.isLoading) {
    return <div>Loading results…</div>;
  }

  if (examQuery.isError) {
    return <div>Failed to load results</div>;
  }

  const attempt = examQuery.data;

  const answers =
    attempt?.answers?.reduce<Record<string, string>>((acc, answer) => {
      if (answer.question_id && answer.response) {
        acc[answer.question_id] = answer.response;
      }
      return acc;
    }, {}) ?? {};

  return (
    <ComponentCard title="Exam Results">
      <ScoreExamAccordion
        questions={attempt?.exam?.questions ?? []}
        answers={answers}
      />
    </ComponentCard>
  );
}
