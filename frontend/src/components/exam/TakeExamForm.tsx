"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";

import Button from "../ui/button/Button";
import Form from "../form/Form";
import ComponentCard from "../common/ComponentCard";

import type { ExamPublic, QuestionPublic } from "@/client";
import ListWithRadio from "../ui/list/ListWithRadio";
import { createExamAttempt } from "@/api/examAttempts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ExamFormData = {
  answers: Record<string, string>;
};

type SubmitExamPayload = {
  exam_id: string;
  answers: Record<string, string>;
};

export default function TakeExamForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const examId = searchParams.get("exam_id");

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<ExamFormData>({
    defaultValues: { answers: {} },
    mode: "onSubmit",
  });

  /* -------------------- Fetch Exam -------------------- */
  const examQuery = useQuery<ExamPublic>({
    queryKey: ["exam", examId],
    enabled: !!examId,
    queryFn: async () => {
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${API_URL}/api/v1/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token || ""}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch exam: ${res.status}`);
      }

      return res.json();
    },
  });

  /* -------------------- Submit Exam -------------------- */
  const submitExamMutation = useMutation({
    mutationFn: (payload: SubmitExamPayload) =>
      createExamAttempt(payload.exam_id, payload.answers),

    onSuccess: (attempt) => {
      router.push(`/score-exam?attempt_id=${attempt.id}`);
    },

    onError: () => {
      router.push("/error-500");
    },
  });

  /* -------------------- Submit Handler -------------------- */
  const onSubmit = (data: ExamFormData) => {
    if (!examId) return;

    submitExamMutation.mutate({
      exam_id: examId,
      answers: data.answers,
    });
  };

  /* -------------------- States -------------------- */
  if (!examId) return <div>Invalid exam</div>;
  if (examQuery.isLoading) return <div>Loading exam...</div>;
  if (examQuery.isError) return <div>Failed to load exam</div>;

  const exam = examQuery.data;

  /* -------------------- Render -------------------- */
  return (
    <ComponentCard title={exam?.title ?? "Exam"}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6">
          {exam?.questions?.map((q: QuestionPublic) => {
            const isRadio =
              q.type === "multiple_choice" || q.type === "true_false";

            if (!isRadio) return null;

            const options =
              q.type === "true_false" ? ["True", "False"] : q.options ?? [];

            return (
              <div key={q.id} className="col-span-full">
                <p className="mb-2 font-medium text-gray-800">
                  {q.question}
                </p>

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
            );
          })}

          <div className="col-span-full">
            <Button
              className="w-full"
              size="sm"
              disabled={isSubmitting}
            >
              Submit Exam
            </Button>
          </div>
        </div>
      </Form>
    </ComponentCard>
  );
}
