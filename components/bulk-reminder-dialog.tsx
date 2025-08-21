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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface FeeRecord {
  id: string
  amount: number
  fee_type: string
  due_date: string
  status: string
  employees?: {
    id: string
    name: string
    email: string
    position: string
  }
}

interface BulkReminderDialogProps {
  children: React.ReactNode
  feeRecords: FeeRecord[]
}

export function BulkReminderDialog({ children, feeRecords }: BulkReminderDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFees, setSelectedFees] = useState<string[]>([])
  const router = useRouter()

  const handleFeeSelection = (feeId: string, checked: boolean) => {
    if (checked) {
      setSelectedFees([...selectedFees, feeId])
    } else {
      setSelectedFees(selectedFees.filter((id) => id !== feeId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFees(feeRecords.map((f) => f.id))
    } else {
      setSelectedFees([])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (selectedFees.length === 0) {
      setError("Please select at least one fee record")
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError("You must be logged in to send reminders")
      setIsLoading(false)
      return
    }

    try {
      // Create reminder records for selected fees
      const reminderRecords = selectedFees.map((feeId) => {
        const feeRecord = feeRecords.find((f) => f.id === feeId)
        return {
          fee_record_id: feeId,
          employee_id: feeRecord?.employees?.id,
          reminder_type: formData.get("reminder_type") as string,
          status: "sent", // In a real app, this would be "pending" until actually sent
          sent_at: new Date().toISOString(),
          created_by: user.id,
        }
      })

      const { error: reminderError } = await supabase.from("reminders").insert(reminderRecords)

      if (reminderError) throw reminderError

      // In a real application, you would integrate with an email service here
      console.log(`Bulk reminders sent to ${selectedFees.length} employees`)

      setOpen(false)
      setSelectedFees([])
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to send bulk reminders")
    } finally {
      setIsLoading(false)
    }
  }

  const defaultMessage = `Dear [Employee Name],

This is a friendly reminder that your [Fee Type] fee of $[Amount] was due on [Due Date].

Please make your payment at your earliest convenience to avoid any late fees.

Thank you for your prompt attention to this matter.

Best regards,
GymManager Pro Team`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Bulk Payment Reminders</DialogTitle>
          <DialogDescription>
            Select employees to send payment reminders to and customize your message.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Fee Records</Label>
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
              <div className="flex items-center space-x-2 mb-3 pb-3 border-b">
                <Checkbox
                  id="select-all"
                  checked={selectedFees.length === feeRecords.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-medium">
                  Select All ({feeRecords.length} records)
                </Label>
              </div>
              <div className="space-y-3">
                {feeRecords.map((fee) => (
                  <div key={fee.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={fee.id}
                      checked={selectedFees.includes(fee.id)}
                      onCheckedChange={(checked) => handleFeeSelection(fee.id, checked as boolean)}
                    />
                    <Label htmlFor={fee.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{fee.employees?.name}</div>
                      <div className="text-sm text-gray-500">
                        ${Number(fee.amount).toLocaleString()} - {fee.fee_type} fee (Due:{" "}
                        {new Date(fee.due_date).toLocaleDateString()})
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {selectedFees.length} of {feeRecords.length} records selected
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder_type">Reminder Type</Label>
            <Select name="reminder_type" defaultValue="email">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS (Coming Soon)</SelectItem>
                <SelectItem value="system">System Notification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message Template</Label>
            <Textarea
              id="message"
              name="message"
              rows={6}
              defaultValue={defaultMessage}
              placeholder="Enter your reminder message template..."
            />
            <div className="text-sm text-gray-500">
              Use placeholders: [Employee Name], [Fee Type], [Amount], [Due Date]
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedFees.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Sending..." : `Send ${selectedFees.length} Reminders`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
