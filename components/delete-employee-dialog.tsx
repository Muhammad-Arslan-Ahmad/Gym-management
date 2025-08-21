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

interface DeleteEmployeeDialogProps {
  children: React.ReactNode
  employeeId: string
  employeeName: string
}

export function DeleteEmployeeDialog({ children, employeeId, employeeName }: DeleteEmployeeDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete employee")
      }

      router.refresh()
    } catch (error) {
      console.error("Error deleting employee:", error)
      alert("Failed to delete employee. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Employee</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {employeeName}? This action cannot be undone and will also delete all
            associated fee records.
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
