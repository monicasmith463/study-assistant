"use client"
import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import SpinnerButton from "@/components/ui/button/SpinnerButton"
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons"
import Link from "next/link"
import React, { useState, useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import useAuth, { useIsLoggedIn } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

type FormData = {
  email: string
  password: string
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { loginMutation, resetError } = useAuth()
  const router = useRouter()
  const isActiveLoggedIn = useIsLoggedIn()

  useEffect(() => {
    if (isActiveLoggedIn) {
      router.push("/")
    }
  }, [router, isActiveLoggedIn])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  })

  const onSubmit: SubmitHandler<FormData> = (data) => {
    resetError()
    loginMutation.mutate(
      { username: data.email, password: data.password },
      {
        onSuccess: () => {
          router.push("/") // Redirect after login
        },
      }
    )
  }

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto mb-5 w-full max-w-md sm:pt-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to home
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="mb-5 sm:mb-8">
          <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
            Sign In
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email and password to sign in!
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="info@gmail.com"
                {...register("email", { required: "Email is required" })}
                error={!!errors.email}
                hint={errors.email?.message}
              />
            </div>

            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  error={!!errors.password}
                  hint={errors.password?.message}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                  )}
                </span>
              </div>
            </div>

            <div>
              <SpinnerButton
                className="w-full"
                size="sm"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Sign In
              </SpinnerButton>
            </div>

            {loginMutation.isError && (
              <p className="text-error-500 text-sm">
                {loginMutation.error?.message ?? "Login failed"}
              </p>
            )}
          </div>
        </form>

        <div className="mt-5">
          <p className="text-center text-sm font-normal text-gray-700 sm:text-start dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
