import TakeExamForm from "@/components/exam/TakeExamForm"
import { Metadata } from "next"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Take Exam",
  description: "Take your practice exam",
}

export default function TakeExam() {
  return <TakeExamForm />
}
