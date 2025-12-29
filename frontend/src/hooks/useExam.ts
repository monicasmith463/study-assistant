import { useMutation, useQuery } from "@tanstack/react-query"
import { ExamsService, type ExamPublic, type ExamAttemptPublic } from "@/client"
import { createExamAttempt } from "@/api/examAttempts"

export function useExam(examId: string | null) {
  return useQuery<ExamPublic>({
    queryKey: ["exam", examId],
    enabled: !!examId,
    queryFn: () => {
      if (!examId) {
        throw new Error("No exam ID")
      }
      return ExamsService.readExam({ id: examId })
    },
  })
}

export function useSubmitExam() {
  return useMutation<
    ExamAttemptPublic,
    Error,
    { exam_id: string; answers: Record<string, string> }
  >({
    mutationFn: async ({ exam_id, answers }) => {
      return createExamAttempt(exam_id, answers)
    },
  })
}
