"use client";
import React, { useState } from "react";
import FaqOne from "./FaqOne";
import type { QuestionPublic, AnswerPublic } from "@/client";

type Props = {
  questions: QuestionPublic[];
  answers: AnswerPublic[];
};

export default function ScoreExamAccordion({ questions, answers }: Props) {
  const answersArray = Array.isArray(answers) ? answers : [];

  const answersByQuestionId = Object.fromEntries(
    answersArray.map((a) => [a.question_id, a])
  );

  const [openIndexes, setOpenIndexes] = useState<number[]>(() =>
    questions
      .map((q, index) => {
        const answer = answersByQuestionId[q.id];
        return answer?.is_correct === false ? index : null;
      })
      .filter((i): i is number => i !== null)
  );

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
        const answer = answersByQuestionId[q.id];

        const isCorrect = answer?.is_correct === true;
        const isWrong = answer?.is_correct === false;
        const explanation = answer?.explanation;


        const statusIcon = isCorrect
          ? "✅"
          : isWrong
          ? "❌"
          : "⏳";

        return (
          <FaqOne
            key={q.id}
            title={`${statusIcon} ${q.question}`}
            isOpen={openIndexes.includes(index)}
            toggleAccordion={() => handleToggle(index)}
            content={
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Your answer:</strong>{" "}
                  {answer?.response || "Not answered"}
                </p>

                {q.correct_answer && (
                  <p>
                    <strong>Correct answer:</strong> {q.correct_answer}
                  </p>
                )}

                {isWrong && (
                  <div className="mt-2">
                    <strong>Explanation:</strong>
                    <p className="mt-1 text-gray-600">
                      {explanation || "No explanation provided."}
                    </p>
                  </div>
                )}
              </div>
            }
          />
        );
      })}
    </div>
  );
}
