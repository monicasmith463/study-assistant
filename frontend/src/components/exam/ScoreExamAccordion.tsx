"use client";
import React, { useState } from "react";
import FaqOne from "./FaqOne";
import type { QuestionPublic } from "@/client";

type Props = {
  questions: QuestionPublic[];
  answers: Record<string, string>;
};

export default function ScoreExamAccordion({ questions, answers }: Props) {
  const [openIndexes, setOpenIndexes] = useState<number[]>(() => {
    return questions
      .map((q, index) => {
        const userAnswer = answers[q.id];
        const isCorrect =
          q.answer && userAnswer && userAnswer === q.answer;

        return isCorrect ? null : index;
      })
      .filter((index): index is number => index !== null);
  });

  const handleToggle = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="space-y-4">
      {questions.map((q, index) => {
        const userAnswer = answers[q.id];
        const isCorrect =
          q.answer && userAnswer && userAnswer === q.answer;

        const statusIcon = isCorrect
          ? "✅"
          : userAnswer
          ? "❌"
          : "⏳";

        return (
          <FaqOne
            key={q.id}
            title={`${statusIcon} ${q.question}`}
            content={
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Your answer:</strong>{" "}
                  {userAnswer ?? "Not answered"}
                </p>

                {q.answer && (
                  <p>
                    <strong>Correct answer:</strong> {q.answer}
                  </p>
                )}

                {q.answer && (
                  <div className="mt-2">
                    <strong>Explanation:</strong>
                    <p className="mt-1 text-gray-600">
                      {/* placeholder or explanation text */}
                      This answer is correct because…
                    </p>
                  </div>
                )}
              </div>
            }
            isOpen={openIndexes.includes(index)}
            toggleAccordion={() => handleToggle(index)}
          />
        );
      })}
    </div>
  );
}
