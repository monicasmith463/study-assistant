"use client"

import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import ComponentCard from "@/components/common/ComponentCard"
import ScoreExamAccordion from "@/components/exam/ScoreExamAccordion"
import YourScore from "@/components/exam/YourScore"
import { fetchExamAttempt } from "@/api/examAttempts"
import type { ExamAttemptPublic } from "@/client"

export default function ScoreExamPage() {
  const searchParams = useSearchParams()
  const examAttemptId = searchParams.get("attempt_id")

  const examQuery = useQuery<ExamAttemptPublic>({
    queryKey: ["examAttempt", examAttemptId],
    enabled: !!examAttemptId,
    queryFn: () => fetchExamAttempt(examAttemptId!),
  })

  if (!examAttemptId) {
    return <div>Missing exam context</div>
  }

  if (examQuery.isLoading) {
    return <div>Loading results…</div>
  }

  if (examQuery.isError) {
    return <div>Failed to load results</div>
  }

  const attempt = examQuery.data

  const answers = attempt?.answers ?? []
  const questions = attempt?.exam?.questions ?? []
  const totalQuestions = questions.length
  const score = attempt?.score

  return (
    <ComponentCard title="Exam Results">
      <YourScore score={score} total={totalQuestions} />
      <ScoreExamAccordion questions={questions} answers={answers} />
    </ComponentCard>
  )
}
