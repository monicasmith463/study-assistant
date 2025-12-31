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
              <TableHeader>Description</TableHeader>
              <TableHeader>Questions</TableHeader>
              <TableHeader>Duration</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">{exam.title}</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">
                  {exam.description || "—"}
                </TableCell>
                <TableCell>{exam.questions?.length || 0}</TableCell>
                <TableCell>
                  {exam.duration_minutes ? `${exam.duration_minutes} min` : "—"}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      exam.is_published
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {exam.is_published ? "Published" : "Draft"}
                  </span>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/exams/${exam.id}`}
                    className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium"
                  >
                    View →
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </ComponentCard>
  )
}
