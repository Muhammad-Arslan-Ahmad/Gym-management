
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface SessionWrapperProps {
  children: React.ReactNode
}

export function SessionWrapper({ children }: SessionWrapperProps) {
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await fetch("/api/auth/validate", {
          method: "GET",
          credentials: "include",
        })
        
        if (response.ok) {
          setIsValid(true)
        } else {
          router.push("/login")
          return
        }
      } catch (error) {
        router.push("/login")
        return
      } finally {
        setIsValidating(false)
      }
    }

    validateSession()
  }, [router])

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Validating session...</div>
      </div>
    )
  }

  if (!isValid) {
    return null
  }

  return <>{children}</>
}
