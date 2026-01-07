import React from "react"
import Link from "next/link"

interface LogoProps {
  className?: string
  showText?: boolean
  onClick?: () => void
}

export default function Logo({
  className = "",
  showText = true,
  onClick,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex flex-shrink-0 items-center gap-2 ${className}`}
      onClick={onClick}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <rect
          x="20"
          y="15"
          width="60"
          height="70"
          rx="4"
          fill="#8019e6"
          opacity="0.9"
        />
        <rect x="25" y="20" width="50" height="60" rx="2" fill="#ffffff" />
        <line
          x1="35"
          y1="35"
          x2="65"
          y2="35"
          stroke="#8019e6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="35"
          y1="45"
          x2="65"
          y2="45"
          stroke="#8019e6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="35"
          y1="55"
          x2="60"
          y2="55"
          stroke="#8019e6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="35"
          y1="65"
          x2="55"
          y2="65"
          stroke="#8019e6"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className="text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          MidtermMock
        </span>
      )}
    </Link>
  )
}
