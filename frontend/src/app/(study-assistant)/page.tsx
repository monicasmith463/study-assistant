// src/app/landing/page.tsx
import Image from "next/image"
import Button from "@/components/ui/button/Button"

export default function LandingPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6">
      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Left: Text */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Turn your documents into
            <span className="block text-blue-600">smart practice exams</span>
          </h1>

          <p className="max-w-xl text-lg text-gray-600 dark:text-gray-300">
            Upload study materials, instantly generate exams, and get AI-powered
            explanations that help you actually learn — not just memorize.
          </p>

          <div className="flex items-center gap-4">
            <Button className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700">
              Generate an Exam
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            No setup required · Works with PDFs
          </p>
        </div>

        {/* Right: Image / Preview */}
        <div className="relative">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <Image
              src="/dashboard-preview.png"
              alt="Study Assistant dashboard preview"
              width={900}
              height={600}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
