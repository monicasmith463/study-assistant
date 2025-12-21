import {
    ExamAttemptsService,
    type ExamAttemptPublic,
  } from "@/client";

/**
 * Create + submit exam attempt in ONE call
 * (exam_id + answers + is_complete)
 */
export async function createExamAttempt(
    examId: string,
    answers: Record<string, string> // question_id → response
  ): Promise<ExamAttemptPublic> {
    return ExamAttemptsService.createExamAttempt({
      requestBody: {
        exam_id: examId,
        is_complete: true,
        answers: Object.entries(answers).map(([question_id, response]) => ({
          question_id,
          response,
        })),
      },
    });
  }

  /**
   * Fetch an exam attempt (for score page)
   */
  export async function fetchExamAttempt(
    attemptId: string
  ): Promise<ExamAttemptPublic> {
    return ExamAttemptsService.readExamAttempt({
      id: attemptId,
    });
  }
