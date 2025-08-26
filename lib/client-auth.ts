
"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useSessionValidation() {
  const router = useRouter()

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await fetch("/api/auth/validate", {
          method: "GET",
          credentials: "include",
        })
        
        if (!response.ok) {
          // Session is invalid, redirect to login
          router.push("/login")
        }
      } catch (error) {
        // Network error or other issues, redirect to login
        router.push("/login")
      }
    }

    validateSession()
  }, [router])
}
