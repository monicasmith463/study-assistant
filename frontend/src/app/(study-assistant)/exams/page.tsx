"use client"

import React from "react"
import Link from "next/link"
import ComponentCard from "@/components/common/ComponentCard"
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/table/Table"
import { useExams } from "@/hooks/useExams"

export default function ExamsPage() {
  const { data, isLoading, isError, error } = useExams()

  if (isLoading) {
    return (
      <ComponentCard title="My Exams">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            Loading exams...
          </div>
        </div>
      </ComponentCard>
    )
  }

  if (isError) {
    return (
      <ComponentCard title="My Exams">
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500 dark:text-red-400">
            Error loading exams: {error?.message || "Unknown error"}
          </div>
        </div>
      </ComponentCard>
    )
  }

  const exams = data?.data || []

  return (
    <ComponentCard title="My Exams" desc={`Total: ${data?.count || 0} exams`}>
      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-gray-500 dark:text-gray-400">
            No exams found. Create your first exam!
          </p>
          <Link
            href="/upload"
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
          >
            Upload a document to get started →
          </Link>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Title</TableHeader>
              <TableHeader>Questions</TableHeader>
              <TableHeader>Highest Score</TableHeader>
              <TableHeader>Date Created</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.map((exam) => {
              const dateCreated = exam.created_at
                ? new Date(exam.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"

              return (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>{exam.questions?.length || 0}</TableCell>
                  <TableCell>
                    {exam.highest_score !== null &&
                    exam.highest_score !== undefined
                      ? `${exam.highest_score.toFixed(1)}%`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {dateCreated}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/take-exam?exam_id=${exam.id}`}
                      className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium"
                    >
                      Take Exam →
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </ComponentCard>
  )
}
