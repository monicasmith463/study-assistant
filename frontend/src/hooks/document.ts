import { useMutation } from "@tanstack/react-query";
import { DocumentsService } from "@/client";

export function useCreateDocument() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      // @ts-ignore: DocumentsService expects JSON, but we need FormData
      DocumentsService.createDocument(formData),
  });
}
