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

interface DeleteFeeDialogProps {
  children: React.ReactNode
  feeId: string
  employeeName: string
}

export function DeleteFeeDialog({ children, feeId, employeeName }: DeleteFeeDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/fees/${feeId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete fee record")
      }

      router.refresh()
    } catch (error) {
      console.error("Error deleting fee record:", error)
      alert("Failed to delete fee record. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Fee Record</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this fee record for {employeeName}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
