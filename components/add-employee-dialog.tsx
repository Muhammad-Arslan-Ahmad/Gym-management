"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface AddEmployeeDialogProps {
  children: React.ReactNode
}

export function AddEmployeeDialog({ children }: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const employeeData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
      position: formData.get("position") as string,
      hire_date: formData.get("hire_date") as string,
      salary: formData.get("salary") ? Number(formData.get("salary")) : null,
      status: formData.get("status") as string,
    }

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add employee")
      }

      setOpen(false)
      router.refresh()
      // Reset form
      ;(e.target as HTMLFormElement).reset()
    } catch (error: any) {
      setError(error.message || "Failed to add employee")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>Enter the employee's information to add them to the system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input id="position" name="position" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire Date *</Label>
              <Input id="hire_date" name="hire_date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input id="salary" name="salary" type="number" step="0.01" placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select name="status" defaultValue="active">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Adding..." : "Add Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
