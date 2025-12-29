"use client"

import React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"

import SpinnerButton from "../ui/button/SpinnerButton"
import Form from "../form/Form"
import ComponentCard from "../common/ComponentCard"

import type { QuestionPublic } from "@/client"
import ListWithRadio from "../ui/list/ListWithRadio"
import { useExam, useSubmitExam } from "@/hooks/useExam"

type ExamFormData = {
  answers: Record<string, string>
}

export default function TakeExamForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const examId = searchParams.get("exam_id")

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ExamFormData>({
    defaultValues: { answers: {} },
    mode: "onSubmit",
  })

  /* -------------------- Fetch Exam -------------------- */
  const examQuery = useExam(examId)

  /* -------------------- Submit Exam -------------------- */
  const submitExamMutation = useSubmitExam()

  /* -------------------- Submit Handler -------------------- */
  const onSubmit = (data: ExamFormData) => {
    if (!examId || submitExamMutation.isPending) return

    submitExamMutation.mutate(
      {
        exam_id: examId,
        answers: data.answers,
      },
      {
        onSuccess: (attempt) => {
          router.push(`/score-exam?attempt_id=${attempt.id}`)
        },
        onError: () => {
          router.push("/error-500")
        },
      }
    )
  }

  /* -------------------- States -------------------- */
  if (!examId) return <div>Invalid exam</div>
  if (examQuery.isLoading) return <div>Loading exam...</div>
  if (examQuery.isError) return <div>Failed to load exam</div>

  const exam = examQuery.data

  /* -------------------- Render -------------------- */
  return (
    <ComponentCard title={exam?.title ?? "Exam"}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6">
          {exam?.questions?.map((q: QuestionPublic) => {
            const isRadio =
              q.type === "multiple_choice" || q.type === "true_false"

            if (!isRadio) return null

            const options =
              q.type === "true_false" ? ["True", "False"] : (q.options ?? [])

            return (
              <div key={q.id} className="col-span-full">
                <p className="mb-2 font-medium text-gray-800">{q.question}</p>

                <Controller
                  name={`answers.${q.id}`}
                  control={control}
                  rules={{ required: "Please select an option." }}
                  render={({ field }) => (
                    <ListWithRadio
                      name={q.id}
                      options={options}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.answers?.[q.id]?.message}
                    />
                  )}
                />
              </div>
            )
          })}

          <div className="col-span-full">
            <SpinnerButton
              className="w-full"
              size="sm"
              disabled={submitExamMutation.isPending}
              loading={submitExamMutation.isPending}
            >
              Submit Exam
            </SpinnerButton>
          </div>
        </div>
      </Form>
    </ComponentCard>
  )
}
