import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ExamsService,
  type GenerateQuestionsRequest,
  type ExamPublic,
} from "@/client"

export function useGenerateExam() {
  const queryClient = useQueryClient()

  return useMutation<ExamPublic, Error, GenerateQuestionsRequest>({
    mutationFn: async (data: GenerateQuestionsRequest) => {
      return ExamsService.generateExam({ requestBody: data })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] })
    },
  })
}
