"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import Button from "../ui/button/Button";
import Form from "../form/Form";
import ComponentCard from "../common/ComponentCard";

import type { ExamPublic, QuestionPublic } from "@/client";
import ListWithRadio from "../ui/list/ListWithRadio";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ExamFormData = {
  answers: Record<string, string>;
};

export default function TakeExamForm() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("exam_id");

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<ExamFormData>({
    defaultValues: {
      answers: {},
    },
  });

  /* -------------------- Fetch Exam -------------------- */
  const examQuery = useQuery<ExamPublic>({
    queryKey: ["exam", examId],
    enabled: !!examId,
    queryFn: async () => {
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${API_URL}/api/v1/exams/${examId}`, {
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch exam: ${res.status}`);
      }

      return res.json();
    },
  });

  /* -------------------- Submit -------------------- */
  const onSubmit = (data: ExamFormData) => {
    console.log("Submitting exam:", {
      examId,
      answers: data.answers,
    });

    // later:
    // submitExamAttemptMutation.mutate(...)
  };

  /* -------------------- States -------------------- */
  if (!examId) {
    return <div>Invalid exam</div>;
  }

  if (examQuery.isLoading) {
    return <div>Loading exam...</div>;
  }

  if (examQuery.isError) {
    return <div>Failed to load exam</div>;
  }

  const exam = examQuery.data;
  const answers = watch("answers");

  /* -------------------- Render -------------------- */
  return (
    <ComponentCard title={exam?.title ?? "Exam"}>
      <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-6">
  {exam?.questions?.map((q: QuestionPublic) => (
    <div key={q.id} className="col-span-full">
      <p className="mb-2 font-medium text-gray-800">
        {q.question}
      </p>

      {q.type === "multiple_choice" && q.options && (
        <ListWithRadio
        name={q.id}
  options={q.options}
  value={answers?.[q.id]}
  onChange={(value: string) =>
    setValue(`answers.${q.id}`, value, { shouldDirty: true })
  }
/>
      )}
      {q.type === "true_false" && (
        <ListWithRadio
        name={q.id}
  options={["True", "False"]}
  value={answers?.[q.id]}
  onChange={(value: string) =>
    setValue(`answers.${q.id}`, value, { shouldDirty: true })
  }
/>
      )}

    </div>
  ))}

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
