"use client";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import Button from "../ui/button/Button";
import Form from "../form/Form";
import ComponentCard from "../common/ComponentCard";
import QuestionInput from "./QuestionInput";
import { useMutation } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TakeExamForm() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("exam_id");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting exam:", examId);
  };



  const getExamMutation = useMutation({
      mutationFn: async (examId: string) => {
        const token = localStorage.getItem("access_token");

        return fetch(`${API_URL}/api/v1/exams/${examId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch exam: ${res.status}`);
            }
            return res.json();
          })
          .catch((err) => {
            console.error("Fetch exam error:", err);
            throw err;
          });
      },

      onSuccess: (data) => {
        console.log("Exam fetched successfully!");
        console.log(data);
      },

      onError: (err: unknown) => {
        console.error("getExamMutation error:", err);
      },
    });

    useEffect(() => {
      if (examId) {
        getExamMutation.mutate(examId);
      }
    }, [examId, getExamMutation]);

  if (!examId) {
    return <div>Invalid exam</div>;
  }

  if (getExamMutation.isError) {
    return <div>Failed to load exam</div>;
  }

  // const exam = getExamMutation.data;

  return (
    <ComponentCard title="Exam Form">
      <Form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <QuestionInput key={i} />
          ))}

          <div className="col-span-full">
            <Button className="w-full" size="sm">
              Submit
            </Button>
          </div>
        </div>
      </Form>
    </ComponentCard>
  );
}
