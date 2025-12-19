"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ComponentCard from "@/components/common/ComponentCard";
import ScoreExamAccordion from "@/components/exam/ScoreExamAccordion";
import type { ExamAttemptPublic } from "@/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ScoreExamPage() {
  const searchParams = useSearchParams();
  const examAttemptId = searchParams.get("attempt_id");

  if (!examAttemptId) {
    return <div>Missing exam context</div>;
  }

  const examQuery = useQuery<ExamAttemptPublic>({
    queryKey: ["examAttemptId", examAttemptId],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${API_URL}/api/v1/exam-attempts/${examAttemptId}`, {
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load exam attempt");
      }
      return res.json();
    },
  });

  if (examQuery.isLoading) {
    return <div>Loading results…</div>;
  }

  if (examQuery.isError) {
    return <div>Failed to load results</div>;
  }

  const attempt = examQuery.data;

  // TODO: replace with real attempt answers later
  const answers = {}; // or from attempt API

  return (
    <ComponentCard title="Exam Results">
      <ScoreExamAccordion
        questions={attempt?.exam?.questions ?? []}
        answers={answers}
      />
    </ComponentCard>
  );
}
