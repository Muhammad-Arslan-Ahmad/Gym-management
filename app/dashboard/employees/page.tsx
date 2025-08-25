import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
export const dynamic = "force-dynamic"
export const revalidate = 0
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { AddEmployeeDialog } from "@/components/add-employee-dialog"
import { DeleteEmployeeDialog } from "@/components/delete-employee-dialog"
import { EmployeeSearch } from "@/components/employee-search"
import type { Employee } from "@/lib/db"

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string }
}) {
  await requireAuth()

  // Build query with filters
  let employees: Employee[] = []

  try {
    if (searchParams.search && searchParams.status) {
      // Both search and status filters
      const searchTerm = `%${searchParams.search}%`
      employees = await sql`
        SELECT * FROM employees 
        WHERE (name ILIKE ${searchTerm} OR email ILIKE ${searchTerm} OR position ILIKE ${searchTerm})
        AND status = ${searchParams.status}
        ORDER BY created_at DESC
      `
    } else if (searchParams.search) {
      // Only search filter
      const searchTerm = `%${searchParams.search}%`
      employees = await sql`
        SELECT * FROM employees 
        WHERE name ILIKE ${searchTerm} OR email ILIKE ${searchTerm} OR position ILIKE ${searchTerm}
        ORDER BY created_at DESC
      `
    } else if (searchParams.status) {
      // Only status filter
      employees = await sql`
        SELECT * FROM employees 
        WHERE status = ${searchParams.status}
        ORDER BY created_at DESC
      `
    } else {
      // No filters
      employees = await sql`
        SELECT * FROM employees 
        ORDER BY created_at DESC
      `
    }
  } catch (error) {
    console.error("Database error:", error)
    employees = []
  }

  return (
    <div>
      <EmployeeSearch searchParams={searchParams} />

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Employees ({employees?.length || 0})</CardTitle>
          <CardDescription>Manage your gym staff members and their details</CardDescription>
        </CardHeader>
        <CardContent>
          {employees && employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Position</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Hire Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Salary</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{employee.name}</div>
                          {employee.phone && <div className="text-sm text-gray-500">{employee.phone}</div>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{employee.email}</td>
                      <td className="py-3 px-4 text-gray-900">{employee.position}</td>
                      <td className="py-3 px-4 text-gray-900">{new Date(employee.hire_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {employee.salary ? `$${Number(employee.salary).toLocaleString()}` : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                          {employee.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/employees/${employee.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeleteEmployeeDialog employeeId={employee.id} employeeName={employee.name}>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DeleteEmployeeDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No employees found</div>
              <AddEmployeeDialog>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Employee
                </Button>
              </AddEmployeeDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
