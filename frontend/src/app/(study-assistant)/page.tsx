// src/app/landing/page.tsx
import Image from "next/image";
import Button from "@/components/ui/button/Button";

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left: Text */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Turn your documents into
            <span className="block text-blue-600">smart practice exams</span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
            Upload study materials, instantly generate exams, and get
            AI-powered explanations that help you actually learn — not just memorize.
          </p>

          <div className="flex items-center gap-4">
            <Button
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
              Generate an Exam
            </Button>


          </div>

          <p className="text-sm text-gray-500">
            No setup required · Works with PDFs
          </p>
        </div>

        {/* Right: Image / Preview */}
        <div className="relative">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden bg-white dark:bg-gray-900">
            <Image
              src="/dashboard-preview.png"
              alt="Study Assistant dashboard preview"
              width={900}
              height={600}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
