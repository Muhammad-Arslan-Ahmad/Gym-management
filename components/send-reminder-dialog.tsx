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
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface FeeRecord {
  id: number
  amount: number
  fee_type: string
  due_date: string
  status: string
  employee_name?: string
  employee_email?: string
  employee_id: number
}

interface SendReminderDialogProps {
  children: React.ReactNode
  feeRecord: FeeRecord
}

export function SendReminderDialog({ children, feeRecord }: SendReminderDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: feeRecord.employee_id,
          fee_record_id: feeRecord.id,
          message: formData.get("message") as string,
          reminder_type: formData.get("reminder_type") as string,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send reminder")
      }

      toast.success(`Payment reminder sent to ${feeRecord.employee_name}`)
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to send reminder")
    } finally {
      setIsLoading(false)
    }
  }

  const defaultMessage = `Dear ${feeRecord.employee_name},

This is a friendly reminder that your ${feeRecord.fee_type} fee of $${Number(feeRecord.amount).toLocaleString()} was due on ${new Date(feeRecord.due_date).toLocaleDateString()}.

Please make your payment at your earliest convenience to avoid any late fees.

Thank you for your prompt attention to this matter.

Best regards,
Gym Management Team`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Payment Reminder</DialogTitle>
          <DialogDescription>
            Send a payment reminder to {feeRecord.employee_name} for their ${Number(feeRecord.amount).toLocaleString()}{" "}
            {feeRecord.fee_type} fee.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reminder_type">Reminder Type</Label>
            <Select name="reminder_type" defaultValue="payment_due">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment_due">Payment Due</SelectItem>
                <SelectItem value="overdue_payment">Overdue Payment</SelectItem>
                <SelectItem value="general">General Reminder</SelectItem>
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
              required
            />
          </div>
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
