import ScoreExamPage from "@/components/exam/ScoreExamPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js ScoreExam Page",
  description: "This is Next.js ScoreExam Page",
};

export default function ScoreExam() {
  return <ScoreExamPage />;
}
