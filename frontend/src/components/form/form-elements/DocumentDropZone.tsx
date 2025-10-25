"use client";
import React, { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { useDropzone } from "react-dropzone";
import SpinnerButton from "@/components/ui/button/SpinnerButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DocumentsService } from "@/client";

const DropzoneComponent: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();

  // Dropzone logic
  const onDrop = (acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [],
    },
  });

  // Mutation for uploading a document
  const createDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return DocumentsService.createDocument({ formData });
    },
    onSuccess: () => {
      console.log("Document uploaded successfully!");
      setFiles([]); // clear selected files
      queryClient.invalidateQueries(["documents"]); // refresh documents list if you have one
    },
    onError: (err: any) => {
      console.error(err);
      console.log("Failed to upload document.");
    },
  });

  const handleSubmit = () => {
    if (files.length === 0) return;
    createDocumentMutation.mutate(files[0]);
  };

  const handleDelete = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full mx-auto">
      <ComponentCard title="Upload Documents">
        <div className="transition border border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-brand-500 dark:border-gray-700 dark:hover:border-brand-500">
          <form
            {...getRootProps()}
            className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10 ${
              isDragActive
                ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
            }`}
          >
            <input {...getInputProps()} />
            <div className="dz-message flex flex-col items-center m-0">
              <h4 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
                {isDragActive ? "Drop Files Here" : "Drag & Drop Files Here"}
              </h4>
              <span className="text-center mb-5 block max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                Drag and drop your PDF documents here or browse
              </span>
              <span className="font-medium underline text-theme-sm text-brand-500">
                Browse File
              </span>
            </div>
          </form>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-md border border-gray-300 p-2 dark:border-gray-700"
              >
                <span className="truncate">{file.name}</span>
                <button
                  onClick={() => handleDelete(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  type="button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-center mt-6">
          <SpinnerButton
            size="md"
            variant="primary"
            onClick={handleSubmit}
            disabled={files.length === 0 || createDocumentMutation.isLoading}
            loading={createDocumentMutation.isLoading}
          >
            Upload Document
          </SpinnerButton>
        </div>
      </ComponentCard>
    </div>
  );
};

export default DropzoneComponent;
