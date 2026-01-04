"use client"

import React, { useState } from "react"
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
import Badge from "@/components/ui/badge/Badge"
import DifficultyBadge from "@/components/exam/DifficultyBadge"
import Pagination from "@/components/ui/pagination/Pagination"

const ITEMS_PER_PAGE = 10

export default function ExamsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const skip = (currentPage - 1) * ITEMS_PER_PAGE
  const { data, isLoading, isError, error } = useExams(skip, ITEMS_PER_PAGE)

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
              <TableHeader>Difficulty</TableHeader>
              <TableHeader>Question Types</TableHeader>
              <TableHeader>Highest Score</TableHeader>
              <TableHeader>Date Created</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.map((exam) => {
              const dateCreated = (exam as any).created_at
                ? new Date((exam as any).created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )
                : "—"

              const questionTypes = (exam as any).question_types || []

              const formatQuestionType = (type: string) => {
                return type
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")
              }

              return (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>{exam.questions?.length || 0}</TableCell>
                  <TableCell>
                    <DifficultyBadge difficulty={(exam as any).difficulty} />
                  </TableCell>
                  <TableCell>
                    {questionTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {questionTypes.map((type: string, idx: number) => (
                          <Badge
                            key={idx}
                            color="info"
                            size="sm"
                            variant="light"
                          >
                            {formatQuestionType(type)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {(exam as any).highest_score !== null &&
                    (exam as any).highest_score !== undefined
                      ? `${(exam as any).highest_score.toFixed(1)}%`
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

      {/* Pagination */}
      {exams.length > 0 && data && (
        <Pagination
          currentPage={currentPage}
          totalItems={data.count}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </ComponentCard>
  )
}
