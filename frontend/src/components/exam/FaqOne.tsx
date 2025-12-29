import React from "react"
import { ChevronDownIcon } from "../../icons"

type FaqOneProps = {
  title: string | React.ReactNode
  content: React.ReactNode
  isOpen: boolean
  toggleAccordion: () => void
}

const FaqOne: React.FC<FaqOneProps> = ({
  title,
  content,
  isOpen,
  toggleAccordion,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Accordion Header */}
      <div
        onClick={toggleAccordion}
        className={`flex cursor-pointer items-center justify-between py-3 pr-3 pl-6 ${
          isOpen ? "bg-gray-50 dark:bg-white/[0.03]" : ""
        }`}
      >
        <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
          {title}
        </h4>
        <button
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 transition-transform duration-200 ease-linear dark:bg-white/[0.03] ${
            isOpen
              ? "rotate-180 text-gray-800 dark:text-white/90"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <ChevronDownIcon />
        </button>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-6 py-7">
          <div className="text-base text-gray-500 dark:text-gray-400">
            {content}
          </div>
        </div>
      )}
    </div>
  )
}

export default FaqOne
