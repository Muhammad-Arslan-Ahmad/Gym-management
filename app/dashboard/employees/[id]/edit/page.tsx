import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { EditEmployeeForm } from "@/components/edit-employee-form"

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get employee data
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("*")
    .eq("id", params.id)
    .single()

  if (employeeError || !employee) {
    redirect("/dashboard/employees")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/employees">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Employees
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Employee</h1>
                <p className="text-sm text-gray-600">Update {employee.name}'s information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
            <CardDescription>Update the employee's details below</CardDescription>
          </CardHeader>
          <CardContent>
            <EditEmployeeForm employee={employee} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
