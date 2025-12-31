"use client"

import Image from "next/image"
import Link from "next/link"
import Button from "@/components/ui/button/Button"
import GridShape from "@/components/common/GridShape"
import { ArrowRightIcon } from "@/icons"
import { useIsLoggedIn } from "@/hooks/useAuth"

export default function LandingPage() {
  const isLoggedIn = useIsLoggedIn()

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
                {isLoggedIn ? (
                  <Link href="/upload">
                    <Button
                      size="md"
                      variant="primary"
                      className="w-full sm:w-auto"
                    >
                      Upload Document
                      <ArrowRightIcon className="h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/signup">
                    <Button
                      size="md"
                      variant="primary"
                      className="w-full sm:w-auto"
                    >
                      Sign Up
                      <ArrowRightIcon className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                {!isLoggedIn && (
                  <Link href="/signin">
                    <Button
                      size="md"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Right: Preview Image */}
            <div className="group relative">
              {/* File icons that pop out from the top - behind screenshot */}
              <div className="absolute -top-14 z-0 flex w-full justify-center transition-all duration-700 ease-in-out group-hover:-top-28 sm:-top-16 sm:group-hover:-top-[4.2rem] lg:-top-20">
                <img
                  src="/pdf.svg"
                  alt="PDF"
                  className="animate-float-slow w-20 translate-x-12 translate-y-6 -rotate-[12deg] transition-all duration-700 ease-in-out group-hover:translate-x-2 group-hover:translate-y-0 sm:w-24 sm:translate-x-16 sm:translate-y-8 md:w-28 lg:w-36 xl:w-44"
                />
                <img
                  src="/powerpoint.svg"
                  alt="PowerPoint"
                  className="animate-float-slow-delay w-20 translate-y-4 rotate-0 transition-all duration-700 ease-in-out group-hover:translate-y-0 sm:w-24 sm:translate-y-6 md:w-28 lg:w-36 xl:w-44"
                />
                <img
                  src="/word.svg"
                  alt="Word"
                  className="animate-float-slow-delay-2 w-20 -translate-x-12 translate-y-6 rotate-[12deg] transition-all duration-700 ease-in-out group-hover:-translate-x-2 group-hover:translate-y-0 sm:w-24 sm:-translate-x-16 sm:translate-y-8 md:w-28 lg:w-36 xl:w-44"
                />
              </div>
              <div className="relative z-10 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="shadow-theme-xl overflow-hidden rounded-2xl bg-white dark:bg-gray-800">
                  <Image
                    src="/images/landing/examresults.png"
                    alt="Study Assistant dashboard preview"
                    width={1200}
                    height={800}
                    className="h-auto w-full scale-110"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
