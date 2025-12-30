import React from "react"

type Step = {
  label: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export default function Stepper({
  steps,
  currentStep,
  className = "",
}: StepperProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep
          const isLast = index === steps.length - 1

          return (
            <React.Fragment key={index}>
              {/* Step Circle and Label */}
              <div className="flex flex-1 flex-col items-center">
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      isCompleted
                        ? "border-brand-500 bg-brand-500 text-white"
                        : isActive
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-gray-300 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold">
                        {stepNumber}
                      </span>
                    )}
                  </div>
                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <p
                      className={`text-sm font-medium ${
                        isActive || isCompleted
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.description && (
                      <p
                        className={`mt-1 text-xs ${
                          isActive || isCompleted
                            ? "text-gray-600 dark:text-gray-300"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-colors ${
                    isCompleted
                      ? "bg-brand-500"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
