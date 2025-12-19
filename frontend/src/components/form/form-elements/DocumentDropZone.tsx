"use client";

import React, { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { useDropzone } from "react-dropzone";
import SpinnerButton from "@/components/ui/button/SpinnerButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowUpIcon, PencilIcon } from "@/icons";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DropzoneComponent: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();

  /* -------------------- Dropzone -------------------- */
  const onDrop = (acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [],
    },
  });

  /* -------------------- Upload Document -------------------- */
  const createDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("access_token");

      const res = await fetch(`${API_URL}/api/v1/documents/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload document");
      }

      return res.json();
    },

    onSuccess: (data) => {
      setDocumentId(data.id);
      setFiles([]);
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },

    onError: (err: unknown) => {
      console.error("Upload failed:", err);
      setLoading(false);
    },
  });

  const handleUpload = () => {
    if (files.length === 0) return;
    createDocumentMutation.mutate(files[0]);
  };

  /* -------------------- Generate Exam -------------------- */
  const generateExamMutation = useMutation({
    mutationFn: async () => {
      if (!documentId) {
        throw new Error("No document ID");
      }

      setLoading(true);

      const token = localStorage.getItem("access_token");

      const res = await fetch(`${API_URL}/api/v1/exams/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          document_ids: [documentId],
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate exam");
      }

      return res.json(); // expects { exam_id }
    },

    onSuccess: (data) => {
      console.log("data", data)
      setLoading(false);
      router.push(`/take-exam?exam_id=${data.id}`);
    },

    onError: (err: unknown) => {
      console.error("Generate exam failed:", err);
      setLoading(false);
    },
  });

  /* -------------------- Remove file -------------------- */
  const handleDelete = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  /* -------------------- Render -------------------- */
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full mx-auto">
      <ComponentCard title="Upload Documents">
        {/* Dropzone */}
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

<div className="flex items-center justify-center mt-6 gap-4">
  <SpinnerButton
    size="sm"
    variant="secondary"
    startIcon={<ArrowUpIcon />}
    onClick={handleUpload}
    disabled={files.length === 0 || loading}
    loading={loading}
  >
    Upload Document
  </SpinnerButton>

  {documentId && (
    <SpinnerButton
      size="md"
      variant="primary"
      startIcon={<PencilIcon />}
      onClick={() => generateExamMutation.mutate()}
      disabled={loading}
      loading={loading}
    >
      Generate Exam
    </SpinnerButton>
  )}
</div>
      </ComponentCard>
    </div>
  );
};

export default DropzoneComponent;
