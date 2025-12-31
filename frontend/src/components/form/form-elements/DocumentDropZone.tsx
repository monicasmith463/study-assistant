"use client"

import React, { useState } from "react"
import ComponentCard from "../../common/ComponentCard"
import { useDropzone, type FileRejection } from "react-dropzone"
import SpinnerButton from "@/components/ui/button/SpinnerButton"
import Spinner from "@/components/ui/spinner"
import Stepper from "@/components/ui/stepper/Stepper"
import { ArrowUpIcon } from "@/icons"
import { useDocument, useCreateDocument } from "@/hooks/useDocument"
import ExamCustomizationForm from "@/components/exam/ExamCustomizationForm"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

const DropzoneComponent: React.FC = () => {
  const [files, setFiles] = useState<File[]>([])
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  // Use the document hook to get processing state
  const { data: document } = useDocument(documentId)
  const isProcessing = document?.status === "processing"
  const isReady = document?.status === "ready"

  // Use the create document hook
  const createDocumentMutation = useCreateDocument()

  /* -------------------- Dropzone -------------------- */
  const onDrop = (acceptedFiles: File[]) => {
    setFileError(null)
    setFiles((prev) => [...prev, ...acceptedFiles])
  }

  const onDropRejected = (fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0]
    if (rejection.errors.some((error) => error.code === "file-too-large")) {
      setFileError(`File "${rejection.file.name}" exceeds the 5MB size limit.`)
    } else if (
      rejection.errors.some((error) => error.code === "file-invalid-type")
    ) {
      setFileError(
        `File "${rejection.file.name}" is not a supported file type. Please upload PDF, DOC, DOCX, PPT, PPTX, or TXT files.`
      )
    } else {
      setFileError(
        `Failed to add file: ${rejection.errors[0]?.message || "Unknown error"}`
      )
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: MAX_FILE_SIZE,
  })

  /* -------------------- Upload Document -------------------- */
  const handleUpload = () => {
    if (files.length === 0) return
    createDocumentMutation.mutate(files[0], {
      onSuccess: (data) => {
        setDocumentId(data.id)
        setFiles([])
      },
      onError: (err: unknown) => {
        console.error("Upload failed:", err)
      },
    })
  }

  /* -------------------- Remove file -------------------- */
  const handleDelete = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  /* -------------------- Determine Current Step -------------------- */
  const getCurrentStep = () => {
    if (documentId && isReady) {
      return 2 // Customize Exam
    }
    if (documentId && isProcessing) {
      return 1 // Still on Upload step while processing
    }
    return 1 // Upload Document
  }

  const steps = [
    {
      label: "Upload Document",
      description: "Upload your document",
    },
    {
      label: "Customize Exam",
      description: "Configure exam settings",
    },
  ]

  /* -------------------- Render -------------------- */
  return (
    <div className="mx-auto flex w-full flex-1 flex-col lg:w-1/2">
      {/* Stepper */}
      <ComponentCard title="Create Exam">
        <Stepper steps={steps} currentStep={getCurrentStep()} />
      </ComponentCard>

      {/* Step 1: Upload Document */}
      {getCurrentStep() === 1 && (
        <ComponentCard title="Upload Documents" className="mt-6">
          {/* Dropzone */}
          <div className="hover:border-brand-500 dark:hover:border-brand-500 cursor-pointer rounded-xl border border-dashed border-gray-300 transition dark:border-gray-700">
            <form
              {...getRootProps()}
              className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10 ${
                isDragActive
                  ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                  : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
              }`}
            >
              <input {...getInputProps()} />
              <div className="dz-message m-0 flex flex-col items-center">
                <h4 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
                  {isDragActive ? "Drop Files Here" : "Drag & Drop Files Here"}
                </h4>
                <span className="mb-5 block max-w-[290px] text-center text-sm text-gray-700 dark:text-gray-400">
                  Drag and drop your documents here or browse (PDF, DOC, DOCX,
                  PPT, PPTX, TXT - Max 5MB)
                </span>
                <span className="text-theme-sm text-brand-500 font-medium underline">
                  Browse File
                </span>
              </div>
            </form>
          </div>

          {/* File Error */}
          {fileError && (
            <div className="border-error-500 bg-error-50 dark:border-error-500 dark:bg-error-500/10 mt-4 rounded-md border p-3">
              <p className="text-error-600 dark:text-error-400 text-sm">
                {fileError}
              </p>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-md border border-gray-300 p-2 dark:border-gray-700"
                >
                  <div className="flex flex-col">
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
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

          <div className="mt-6 flex items-center justify-center gap-4">
            <SpinnerButton
              size="sm"
              variant="secondary"
              startIcon={<ArrowUpIcon />}
              onClick={handleUpload}
              disabled={
                files.length === 0 ||
                createDocumentMutation.isPending ||
                isProcessing
              }
              loading={createDocumentMutation.isPending || isProcessing}
            >
              Upload Document
            </SpinnerButton>
          </div>
        </ComponentCard>
      )}

      {/* Step 2: Customize Exam */}
      {getCurrentStep() === 2 && documentId && isReady && (
        <div className="mt-6">
          <ExamCustomizationForm documentId={documentId} />
        </div>
      )}

      {/* Processing State */}
      {documentId && isProcessing && (
        <ComponentCard title="Processing Document" className="mt-6">
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        </ComponentCard>
      )}
    </div>
  )
}

export default DropzoneComponent
