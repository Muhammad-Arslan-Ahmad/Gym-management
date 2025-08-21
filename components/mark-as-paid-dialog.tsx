"use client"

import type React from "react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface MarkAsPaidDialogProps {
  children: React.ReactNode
  feeId: string
  employeeName: string
  amount: number
}

export function MarkAsPaidDialog({ children, feeId, employeeName, amount }: MarkAsPaidDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleMarkAsPaid = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/fees/${feeId}/mark-paid`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to mark fee as paid")
      }

      router.refresh()
    } catch (error) {
      console.error("Error marking fee as paid:", error)
      alert("Failed to mark fee as paid. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark as Paid</AlertDialogTitle>
          <AlertDialogDescription>
            Mark the ${amount.toLocaleString()} fee for {employeeName} as paid? This will update the status and set
            today as the payment date.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleMarkAsPaid}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
          >
            {isLoading ? "Processing..." : "Mark as Paid"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
