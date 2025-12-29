import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { DocumentsService } from "@/client"

export function useDocument(documentId: string | null) {
  return useQuery({
    queryKey: ["document", documentId],

    queryFn: () => {
      if (!documentId) {
        throw new Error("No document ID")
      }

      return DocumentsService.readDocument({ id: documentId })
    },

    enabled: !!documentId,

    // 🔑 Poll ONLY while processing
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === "processing" ? 2000 : false
    },

    refetchOnWindowFocus: false,
    retry: false,
  })
}

export function useCreateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      return DocumentsService.createDocument({
        formData: {
          file,
        },
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
    },
  })
}
