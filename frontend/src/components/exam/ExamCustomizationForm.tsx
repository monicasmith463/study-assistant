"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import ComponentCard from "../common/ComponentCard"
import Label from "../form/Label"
import InputField from "../form/input/InputField"
import Select from "../form/Select"
import Checkbox from "../form/input/Checkbox"
import SpinnerButton from "../ui/button/SpinnerButton"
import { useGenerateExam } from "@/hooks/useGenerateExam"
import { type GenerateQuestionsPublic, type QuestionType } from "@/client"

type Difficulty = "easy" | "medium" | "hard"
import { PencilIcon } from "@/icons"

type ExamCustomizationFormProps = {
  documentId: string
}

export default function ExamCustomizationForm({
  documentId,
}: ExamCustomizationFormProps) {
  const router = useRouter()
  const [numQuestions, setNumQuestions] = useState<number | "">(5)
  const [difficulty, setDifficulty] = useState<Difficulty | "">("")
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([])

  const generateExamMutation = useGenerateExam()

  // Handle success and error in the form submission
  const handleMutationSuccess = (data: { id: string }) => {
    router.push(`/take-exam?exam_id=${data.id}`)
  }

  const handleMutationError = () => {
    router.push("/error-500")
  }

  const handleQuestionTypeChange = (type: QuestionType, checked: boolean) => {
    if (checked) {
      setQuestionTypes((prev) => [...prev, type])
    } else {
      setQuestionTypes((prev) => prev.filter((t) => t !== type))
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    // Ensure num_questions is valid (default to 5 if empty or invalid)
    const validNumQuestions =
      typeof numQuestions === "number" && numQuestions > 0 ? numQuestions : 5

    const payload: GenerateQuestionsPublic & {
      num_questions?: number
      difficulty?: Difficulty | null
      question_types?: QuestionType[]
    } = {
      document_ids: [documentId],
      num_questions: validNumQuestions,
      difficulty: difficulty === "" ? null : (difficulty as Difficulty),
      question_types: questionTypes.length > 0 ? questionTypes : undefined,
    }

    generateExamMutation.mutate(payload, {
      onSuccess: handleMutationSuccess,
      onError: handleMutationError,
    })
  }

  return (
    <ComponentCard title="Customize Your Exam">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Number of Questions */}
        <div>
          <Label htmlFor="num_questions">Number of Questions</Label>
          <InputField
            type="number"
            id="num_questions"
            name="num_questions"
            min={5}
            max={10}
            value={numQuestions}
            onChange={(e) => {
              const value = e.target.value
              if (value === "") {
                setNumQuestions("")
              } else {
                const num = parseInt(value, 10)
                if (!isNaN(num)) {
                  setNumQuestions(num)
                }
              }
            }}
            className="mt-1.5"
          />
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Choose between 5 and 10 questions
          </p>
        </div>

        {/* Difficulty */}
        <div>
          <Label htmlFor="difficulty">Difficulty (Optional)</Label>
          <Select
            options={[
              { value: "", label: "Any Difficulty" },
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
            ]}
            placeholder="Select difficulty"
            defaultValue=""
            onChange={(value) => setDifficulty(value as Difficulty | "")}
            className="mt-1.5"
          />
        </div>

        {/* Question Types */}
        <div>
          <Label>Question Types (Optional)</Label>
          <div className="mt-3 space-y-3">
            <Checkbox
              id="multiple_choice"
              label="Multiple Choice"
              checked={questionTypes.includes("multiple_choice")}
              onChange={(checked) =>
                handleQuestionTypeChange("multiple_choice", checked)
              }
            />
            <Checkbox
              id="true_false"
              label="True/False"
              checked={questionTypes.includes("true_false")}
              onChange={(checked) =>
                handleQuestionTypeChange("true_false", checked)
              }
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Leave unchecked to include all question types
          </p>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <SpinnerButton
            size="md"
            variant="primary"
            startIcon={<PencilIcon />}
            onClick={() => handleSubmit()}
            disabled={generateExamMutation.isPending}
            loading={generateExamMutation.isPending}
          >
            Generate Exam
          </SpinnerButton>
        </div>
      </form>
    </ComponentCard>
  )
}
