"use client"

import React from "react"

interface TableProps {
  children: React.ReactNode
  className?: string
}

export const Table: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse text-left ${className}`}>
        {children}
      </table>
    </div>
  )
}

export const TableHead: React.FC<TableProps> = ({
  children,
  className = "",
}) => {
  return (
    <thead
      className={`border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50 ${className}`}
    >
      {children}
    </thead>
  )
}

export const TableBody: React.FC<TableProps> = ({
  children,
  className = "",
}) => {
  return (
    <tbody
      className={`divide-y divide-gray-200 dark:divide-gray-800 ${className}`}
    >
      {children}
    </tbody>
  )
}

export const TableRow: React.FC<TableProps> = ({
  children,
  className = "",
}) => {
  return (
    <tr
      className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${className}`}
    >
      {children}
    </tr>
  )
}

export const TableHeader: React.FC<TableProps> = ({
  children,
  className = "",
}) => {
  return (
    <th
      className={`px-6 py-3 text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300 ${className}`}
    >
      {children}
    </th>
  )
}

export const TableCell: React.FC<TableProps> = ({
  children,
  className = "",
}) => {
  return (
    <td
      className={`px-6 py-4 text-sm text-gray-900 dark:text-gray-100 ${className}`}
    >
      {children}
    </td>
  )
}
