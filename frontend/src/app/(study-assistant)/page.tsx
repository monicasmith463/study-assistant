"use client"

import Image from "next/image"
import Link from "next/link"
import Button from "@/components/ui/button/Button"
import GridShape from "@/components/common/GridShape"
import { ArrowRightIcon } from "@/icons"

export default function LandingPage() {
  return (
    <div className="relative -mx-4 -my-4 overflow-hidden bg-white md:-mx-6 md:-my-6 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="from-brand-50 to-blue-light-50 dark:from-brand-950/20 dark:to-blue-light-950/20 relative z-1 overflow-hidden bg-gradient-to-br via-white px-6 py-20 sm:py-24 lg:py-32 dark:via-gray-900">
        <GridShape />
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left: Text Content */}
            <div className="space-y-8 text-center lg:text-left">
              <h1 className="text-title-lg sm:text-title-xl lg:text-title-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Turn your documents into
                <span className="text-brand-500 dark:text-brand-400 block">
                  practice exams
                </span>
              </h1>

              <p className="mx-auto max-w-xl text-lg text-gray-600 lg:mx-0 dark:text-gray-300">
                Stop rereading lecture slides. Practice with exams instead.
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Link href="/signup">
                  <Button
                    size="md"
                    variant="primary"
                    className="w-full sm:w-auto"
                  >
                    Try with a PDF
                    <ArrowRightIcon className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button
                    size="md"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Works with PDFs
              </p>
            </div>

            {/* Right: Preview Image */}
            <div className="relative">
              <div className="shadow-theme-xl overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800">
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
      </section>
    </div>
  )
}
