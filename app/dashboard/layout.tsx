import type React from "react"
import { requireAuth, logout } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, Bell, Home, LogOut } from "lucide-react"
import Link from "next/link"

async function logoutAction() {
  "use server"
  await logout()
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await requireAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-900">Gym Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              <form action={logoutAction}>
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <Link href="/dashboard/employees">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Employees</span>
              </Button>
            </Link>
            <Link href="/dashboard/fees">
              <Button variant="ghost" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Fees</span>
              </Button>
            </Link>
            <Link href="/dashboard/reminders">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Reminders</span>
              </Button>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </div>
  )
}
