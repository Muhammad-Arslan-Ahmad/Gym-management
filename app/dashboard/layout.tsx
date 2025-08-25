import type React from "react"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, Bell, Home, LogOut, Settings } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-xl font-bold text-blue-900 hover:text-blue-700 cursor-pointer">Gym Management</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <form action="/api/auth/logout" method="POST">
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
