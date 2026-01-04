"use client"

import React from "react"
import { ChevronLeftIcon, ArrowRightIcon } from "@/icons"

type PaginationProps = {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const skip = (currentPage - 1) * itemsPerPage

  if (totalPages <= 1) {
    return null
  }

  const handlePrevious = () => {
    onPageChange(Math.max(1, currentPage - 1))
  }

  const handleNext = () => {
    onPageChange(Math.min(totalPages, currentPage + 1))
  }

  const getPageNumbers = () => {
    if (totalPages <= 1) return []

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (page) => {
        // Show first page, last page, current page, and pages around current
        if (page === 1) return true
        if (page === totalPages) return true
        if (Math.abs(page - currentPage) <= 1) return true
        return false
      }
    )

    // Build the result with ellipsis
    const result: (number | "ellipsis")[] = []
    let prevPage = 0

    pages.forEach((page) => {
      // Add ellipsis if there's a gap
      if (prevPage > 0 && page - prevPage > 1) {
        result.push("ellipsis")
      }
      result.push(page)
      prevPage = page
    })

    return result
  }

  return (
    <div className="mt-6 flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 dark:border-gray-800">
      {/* Mobile pagination */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Next
        </button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{skip + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(skip + itemsPerPage, totalItems)}
            </span>{" "}
            of <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-gray-700 dark:hover:bg-gray-800"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            {getPageNumbers().map((page, idx) => {
              if (page === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 ring-inset focus:outline-offset-0 dark:text-gray-300 dark:ring-gray-700"
                  >
                    ...
                  </span>
                )
              }

              const isActive = currentPage === page

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset focus:z-20 focus:outline-offset-0 ${
                    isActive
                      ? "bg-brand-600 focus-visible:outline-brand-600 z-10 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      : "text-gray-900 ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              )
            })}
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-gray-700 dark:hover:bg-gray-800"
            >
              <span className="sr-only">Next</span>
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
