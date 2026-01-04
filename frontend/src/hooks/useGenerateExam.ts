import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ExamsService,
  type GenerateQuestionsPublic,
  type ExamPublic,
} from "@/client"

export function useGenerateExam() {
  const queryClient = useQueryClient()

  return useMutation<ExamPublic, Error, GenerateQuestionsPublic>({
    mutationFn: async (data: GenerateQuestionsPublic) => {
      return ExamsService.generateExam({ requestBody: data })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] })
    },
  })
}
