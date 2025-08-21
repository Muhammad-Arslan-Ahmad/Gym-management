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

interface SendReminderDialogProps {
  children: React.ReactNode
  feeRecord: FeeRecord
}

export function SendReminderDialog({ children, feeRecord }: SendReminderDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

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
      // Create reminder record
      const { error: reminderError } = await supabase.from("reminders").insert({
        fee_record_id: feeRecord.id,
        employee_id: feeRecord.employees?.id,
        reminder_type: formData.get("reminder_type") as string,
        status: "sent", // In a real app, this would be "pending" until actually sent
        sent_at: new Date().toISOString(),
        created_by: user.id,
      })

      if (reminderError) throw reminderError

      // In a real application, you would integrate with an email service here
      // For demo purposes, we'll just simulate sending the reminder
      console.log("Reminder sent to:", feeRecord.employees?.email)
      console.log("Message:", formData.get("message"))

      setOpen(false)
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to send reminder")
    } finally {
      setIsLoading(false)
    }
  }

  const defaultMessage = `Dear ${feeRecord.employees?.name},

This is a friendly reminder that your ${feeRecord.fee_type} fee of $${Number(feeRecord.amount).toLocaleString()} was due on ${new Date(feeRecord.due_date).toLocaleDateString()}.

Please make your payment at your earliest convenience to avoid any late fees.

Thank you for your prompt attention to this matter.

Best regards,
GymManager Pro Team`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Payment Reminder</DialogTitle>
          <DialogDescription>
            Send a payment reminder to {feeRecord.employees?.name} for their $
            {Number(feeRecord.amount).toLocaleString()} {feeRecord.fee_type} fee.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              rows={8}
              defaultValue={defaultMessage}
              placeholder="Enter your reminder message..."
            />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Sending..." : "Send Reminder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
