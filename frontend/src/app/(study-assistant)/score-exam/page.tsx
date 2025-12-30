import ScoreExamPage from "@/components/exam/ScoreExamPage"
import { Metadata } from "next"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Exam Results",
  description: "View your exam results and feedback",
}

export default function ScoreExam() {
  return <ScoreExamPage />
}
