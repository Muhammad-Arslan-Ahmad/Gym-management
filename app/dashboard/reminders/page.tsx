import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Send, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { SendReminderDialog } from "@/components/send-reminder-dialog"
import { BulkReminderDialog } from "@/components/bulk-reminder-dialog"

async function getRemindersData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/reminders`, {
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error("Failed to fetch reminders data")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching reminders data:", error)
    return { overdueFeesData: [], recentReminders: [] }
  }
}

export default async function RemindersPage() {
  const { overdueFeesData, recentReminders } = await getRemindersData()

  // Calculate stats
  const overdueCount = overdueFeesData?.filter((f: any) => f.status === "overdue").length || 0
  const pendingCount = overdueFeesData?.filter((f: any) => f.status === "pending").length || 0
  const totalAmount = overdueFeesData?.reduce((sum: number, f: any) => sum + Number(f.amount), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Payment Reminders</h1>
                <p className="text-sm text-gray-600">Send and track payment reminder notifications</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Fees</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Due soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
              <Mail className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Needs collection</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Outstanding Fees */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Outstanding Fees</CardTitle>
                  <CardDescription>Fees that need payment reminders</CardDescription>
                </div>
                <BulkReminderDialog feeRecords={overdueFeesData || []}>
                  <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Send Bulk Reminders
                  </Button>
                </BulkReminderDialog>
              </div>
            </CardHeader>
            <CardContent>
              {overdueFeesData && overdueFeesData.length > 0 ? (
                <div className="space-y-4">
                  {overdueFeesData.slice(0, 8).map((fee: any) => (
                    <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{fee.employee_name}</div>
                        <div className="text-sm text-gray-500">
                          ${Number(fee.amount).toLocaleString()} - {fee.fee_type} fee
                        </div>
                        <div className="text-sm text-gray-500">Due: {new Date(fee.due_date).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={fee.status === "overdue" ? "destructive" : "secondary"}>{fee.status}</Badge>
                        <SendReminderDialog feeRecord={fee}>
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </SendReminderDialog>
                      </div>
                    </div>
                  ))}
                  {overdueFeesData.length > 8 && (
                    <div className="text-center pt-4">
                      <Link href="/dashboard/fees?status=pending,overdue">
                        <Button variant="outline">View All Outstanding Fees</Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <div className="text-gray-500">No outstanding fees requiring reminders</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reminders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reminders</CardTitle>
              <CardDescription>Latest reminder activity</CardDescription>
            </CardHeader>
            <CardContent>
              {recentReminders && recentReminders.length > 0 ? (
                <div className="space-y-4">
                  {recentReminders.map((reminder: any) => (
                    <div key={reminder.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{reminder.employee_name}</div>
                        <div className="text-sm text-gray-500">
                          ${Number(reminder.amount || 0).toLocaleString()} - {reminder.fee_type || "General"} fee
                        </div>
                        <div className="text-sm text-gray-500">
                          {reminder.sent_at ? new Date(reminder.sent_at).toLocaleString() : "Not sent yet"}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">sent</Badge>
                        <div className="text-gray-400">
                          <Mail className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">No reminders sent yet</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
