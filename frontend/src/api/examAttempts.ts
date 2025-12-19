import type {
    ExamAttemptPublic,
    ExamAttemptUpdate,
  } from "@/client";

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
  });

  export async function submitExamAttempt(
    examId: string,
    answers: Record<string, string>
  ): Promise<ExamAttemptPublic> {
    /* 1️⃣ Create attempt */
    const createRes = await fetch(`${API_URL}/api/v1/exam-attempts/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        exam_id: examId,
        is_complete: false,
      }),
    });

    if (!createRes.ok) {
      throw new Error("Failed to create exam attempt");
    }

    const attempt = await createRes.json();

    /* 2️⃣ Update attempt */
    const updatePayload: ExamAttemptUpdate = {
      is_complete: true,
      answers: Object.entries(answers).map(([id, response]) => ({
        id,
        response,
      })),
    };

    const updateRes = await fetch(
      `${API_URL}/api/v1/exam-attempts/${attempt.id}`,
      {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(updatePayload),
      }
    );

    if (!updateRes.ok) {
      throw new Error("Failed to submit exam");
    }

    return updateRes.json();
  }
