import {
    ExamAttemptsService,
    type ExamAttemptPublic,
    type ExamAttemptUpdate,
  } from "@/client";

  /**
   * Create an exam attempt (step 1)
   */
  export async function createExamAttempt(
    examId: string
  ): Promise<ExamAttemptPublic> {
    return ExamAttemptsService.createExamAttempt({
      requestBody: {
        exam_id: examId,
      },
    });
  }

  /**
   * Submit answers + complete attempt (step 2)
   *
   * IMPORTANT:
   * - `answers` must map ANSWER_ID → response
   */
  export async function submitExamAttempt(
    attemptId: string,
    answers: Record<string, string>
  ): Promise<ExamAttemptPublic> {
    const payload: ExamAttemptUpdate = {
      is_complete: true,
      answers: Object.entries(answers).map(([question_id, response]) => ({
        question_id,
        response,
      })),
    };

    return ExamAttemptsService.updateExamAttempt({
      attemptId: attemptId,
      requestBody: payload,
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
