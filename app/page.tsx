import { Button } from "@/components/ui/button"
import { Users, DollarSign, Bell, Home, Building2 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Gym Management System</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete solution for managing gym employees, tracking fees, and handling payments
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Link href="/dashboard">
            <Button className="w-full h-32 flex flex-col items-center justify-center space-y-3 bg-white text-gray-900 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50">
              <Home className="h-8 w-8 text-blue-600" />
              <div className="text-center">
                <div className="font-semibold">Dashboard</div>
                <div className="text-sm text-gray-500">Overview & Analytics</div>
              </div>
            </Button>
          </Link>

          <Link href="/dashboard/employees">
            <Button className="w-full h-32 flex flex-col items-center justify-center space-y-3 bg-white text-gray-900 border-2 border-gray-200 hover:border-green-500 hover:bg-green-50">
              <Users className="h-8 w-8 text-green-600" />
              <div className="text-center">
                <div className="font-semibold">Employees</div>
                <div className="text-sm text-gray-500">Manage Staff</div>
              </div>
            </Button>
          </Link>

          <Link href="/dashboard/fees">
            <Button className="w-full h-32 flex flex-col items-center justify-center space-y-3 bg-white text-gray-900 border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="text-center">
                <div className="font-semibold">Fee Tracking</div>
                <div className="text-sm text-gray-500">Payment Management</div>
              </div>
            </Button>
          </Link>

          <Link href="/dashboard/reminders">
            <Button className="w-full h-32 flex flex-col items-center justify-center space-y-3 bg-white text-gray-900 border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50">
              <Bell className="h-8 w-8 text-orange-600" />
              <div className="text-center">
                <div className="font-semibold">Reminders</div>
                <div className="text-sm text-gray-500">Payment Alerts</div>
              </div>
            </Button>
          </Link>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500">Demo Mode - Authentication disabled for easy access</p>
        </div>
      </div>
    </div>
  )
}
