import { useQuery } from "@tanstack/react-query"
import { ExamsService, type ExamsPublic } from "@/client"

export function useExams(skip: number = 0, limit: number = 100) {
  return useQuery<ExamsPublic>({
    queryKey: ["exams", skip, limit],
    queryFn: () => ExamsService.readExams({ skip, limit }),
  })
}
