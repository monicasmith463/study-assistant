"use client"
import React, { useState } from "react"
import FaqOne from "./FaqOne"
import type { QuestionPublic, AnswerPublic } from "@/client"
import Badge from "@/components/ui/badge/Badge"

type Props = {
  questions: QuestionPublic[]
  answers: AnswerPublic[]
}

export default function ScoreExamAccordion({ questions, answers }: Props) {
  const answersArray = Array.isArray(answers) ? answers : []

  const answersByQuestionId = Object.fromEntries(
    answersArray.map((a) => [a.question_id, a])
  )

  const [openIndexes, setOpenIndexes] = useState<number[]>(() =>
    questions
      .map((q, index) => {
        const answer = answersByQuestionId[q.id]
        return answer?.is_correct === false ? index : null
      })
      .filter((i): i is number => i !== null)
  )

  const handleToggle = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  return (
    <div className="space-y-4">
      {questions.map((q, index) => {
        const answer = answersByQuestionId[q.id]

        const isCorrect = answer?.is_correct === true
        const isWrong = answer?.is_correct === false
        const explanation = answer?.explanation

        const statusBadge = isCorrect ? (
          <span className="mr-2">
            <Badge color="success" size="sm" variant="light">
              Correct
            </Badge>
          </span>
        ) : isWrong ? (
          <span className="mr-2">
            <Badge color="error" size="sm" variant="light">
              Incorrect
            </Badge>
          </span>
        ) : (
          <span className="mr-2">
            <Badge color="warning" size="sm" variant="light">
              Not answered
            </Badge>
          </span>
        )

        return (
          <FaqOne
            key={q.id}
            title={
              <span className="flex items-center">
                {statusBadge}
                {q.question}
              </span>
            }
            isOpen={openIndexes.includes(index)}
            toggleAccordion={() => handleToggle(index)}
            content={
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong className="text-gray-800 dark:text-white/90">
                    Your answer:
                  </strong>{" "}
                  {answer?.response || "Not answered"}
                </p>

                {q.correct_answer && (
                  <p>
                    <strong className="text-gray-800 dark:text-white/90">
                      Correct answer:
                    </strong>{" "}
                    {q.correct_answer}
                  </p>
                )}

                {isWrong && explanation && typeof explanation === "object" && (
                  <div className="mt-2 space-y-2">
                    <p>
                      <strong className="text-gray-800 dark:text-white/90">
                        Explanation:
                      </strong>{" "}
                      {explanation.explanation}
                    </p>

                    <p>
                      <strong className="text-gray-800 dark:text-white/90">
                        Key takeaway:
                      </strong>{" "}
                      {explanation.key_takeaway}
                    </p>

                    <p>
                      <strong className="text-gray-800 dark:text-white/90">
                        Suggested review:
                      </strong>{" "}
                      {explanation.suggested_review}
                    </p>
                  </div>
                )}

                {isWrong && !explanation && (
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    No explanation provided.
                  </p>
                )}
              </div>
            }
          />
        )
      })}
    </div>
  )
}
