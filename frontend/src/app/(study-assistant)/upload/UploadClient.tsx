"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DocumentDropzoneComponent from "@/components/form/form-elements/DocumentDropZone"

export default function UploadClient() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    // Check after mount to avoid SSR issues
    const token = localStorage.getItem("access_token")
    const loggedIn = token !== null
    setIsLoggedIn(loggedIn)

    if (!loggedIn) {
      router.push("/error-404")
    }
  }, [router])

  // Show nothing while checking or if not logged in
  if (isLoggedIn === null || !isLoggedIn) {
    return null
  }

  return <DocumentDropzoneComponent />
}
