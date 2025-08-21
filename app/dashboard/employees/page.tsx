"use client"

import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { AddEmployeeDialog } from "@/components/add-employee-dialog"
import { DeleteEmployeeDialog } from "@/components/delete-employee-dialog"
import type { Employee } from "@/lib/db"

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string }
}) {
  await requireAuth()

  // Build query with filters
  let query = `
    SELECT * FROM employees 
    WHERE 1=1
  `
  const params: any[] = []

  if (searchParams.search) {
    query += ` AND (name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1} OR position ILIKE $${params.length + 1})`
    params.push(`%${searchParams.search}%`)
  }

  if (searchParams.status) {
    query += ` AND status = $${params.length + 1}`
    params.push(searchParams.status)
  }

  query += ` ORDER BY created_at DESC`

  const employees = (await sql(query, ...params)) as Employee[]

  return (
    <div>
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <form method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search employees by name, email, or position..."
              className="pl-10"
              defaultValue={searchParams.search}
              name="search"
            />
            {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
          </form>
        </div>
        <div className="flex gap-2">
          <form method="GET">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              defaultValue={searchParams.status || ""}
              name="status"
              onChange={(e) => (e.target.form as HTMLFormElement).submit()}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {searchParams.search && <input type="hidden" name="search" value={searchParams.search} />}
          </form>
          <AddEmployeeDialog>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </AddEmployeeDialog>
        </div>
      </div>

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
