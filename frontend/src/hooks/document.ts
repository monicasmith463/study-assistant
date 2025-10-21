import { useMutation } from '@tanstack/react-query';
import { DocumentsCreateDocumentData, DocumentsService } from '@/client';

export function useCreateDocument() {
  return useMutation({
    mutationFn: (data: DocumentsCreateDocumentData) =>
      DocumentsService.createDocument(data),
  });
}
