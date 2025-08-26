
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSessionValidation } from "@/lib/client-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { AddEmployeeDialog } from "@/components/add-employee-dialog"
import { DeleteEmployeeDialog } from "@/components/delete-employee-dialog"
import { EmployeeSearch } from "@/components/employee-search"
import type { Employee } from "@/lib/db"
import { redirect } from "next/navigation"

const EMPLOYEES_PER_PAGE = 10

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; page?: string }
}) {
  try {
    await requireAuth()
  } catch (error) {
    redirect("/login")
  }

  const currentPage = parseInt(searchParams.page || "1", 10)
  const offset = (currentPage - 1) * EMPLOYEES_PER_PAGE

  // Build query with filters and pagination
  let employees: Employee[] = []
  let totalCount = 0

  try {
    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) as total FROM employees WHERE 1=1"
    const countParams: any[] = []
    
    if (searchParams.search) {
      const searchTerm = `%${searchParams.search}%`
      countQuery += " AND (name ILIKE $1 OR email ILIKE $1 OR position ILIKE $1)"
      countParams.push(searchTerm)
    }
    
    if (searchParams.status) {
      const statusParam = searchParams.search ? "$2" : "$1"
      countQuery += ` AND status = ${statusParam}`
      countParams.push(searchParams.status)
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM employees WHERE 
      ${searchParams.search ? sql`(name ILIKE ${'%' + searchParams.search + '%'} OR email ILIKE ${'%' + searchParams.search + '%'} OR position ILIKE ${'%' + searchParams.search + '%'})` : sql`1=1`}
      ${searchParams.status ? sql`AND status = ${searchParams.status}` : sql``}`
    
    totalCount = parseInt(countResult[0]?.total || "0", 10)

    // Get employees with pagination
    if (searchParams.search && searchParams.status) {
      const searchTerm = `%${searchParams.search}%`
      employees = await sql`
        SELECT * FROM employees 
        WHERE (name ILIKE ${searchTerm} OR email ILIKE ${searchTerm} OR position ILIKE ${searchTerm})
        AND status = ${searchParams.status}
        ORDER BY created_at DESC
        LIMIT ${EMPLOYEES_PER_PAGE} OFFSET ${offset}
      `
    } else if (searchParams.search) {
      const searchTerm = `%${searchParams.search}%`
      employees = await sql`
        SELECT * FROM employees 
        WHERE name ILIKE ${searchTerm} OR email ILIKE ${searchTerm} OR position ILIKE ${searchTerm}
        ORDER BY created_at DESC
        LIMIT ${EMPLOYEES_PER_PAGE} OFFSET ${offset}
      `
    } else if (searchParams.status) {
      employees = await sql`
        SELECT * FROM employees 
        WHERE status = ${searchParams.status}
        ORDER BY created_at DESC
        LIMIT ${EMPLOYEES_PER_PAGE} OFFSET ${offset}
      `
    } else {
      employees = await sql`
        SELECT * FROM employees 
        ORDER BY created_at DESC
        LIMIT ${EMPLOYEES_PER_PAGE} OFFSET ${offset}
      `
    }
  } catch (error) {
    console.error("Database error:", error)
    employees = []
  }

  const totalPages = Math.ceil(totalCount / EMPLOYEES_PER_PAGE)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  return (
    <div>
      <EmployeeSearch searchParams={searchParams} />

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Employees ({totalCount})</CardTitle>
          <CardDescription>
            Manage your gym staff members and their details
            {totalPages > 1 && (
              <span className="ml-2">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees && employees.length > 0 ? (
            <>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {offset + 1} to {Math.min(offset + EMPLOYEES_PER_PAGE, totalCount)} of {totalCount} employees
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link 
                      href={{
                        pathname: "/dashboard/employees",
                        query: { 
                          ...searchParams, 
                          page: (currentPage - 1).toString() 
                        }
                      }}
                    >
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={!hasPrevPage}
                        className={!hasPrevPage ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                    </Link>
                    
                    <span className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <Link 
                      href={{
                        pathname: "/dashboard/employees",
                        query: { 
                          ...searchParams, 
                          page: (currentPage + 1).toString() 
                        }
                      }}
                    >
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={!hasNextPage}
                        className={!hasNextPage ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </>
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
