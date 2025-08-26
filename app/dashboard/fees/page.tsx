"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSessionValidation } from "@/lib/client-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Trash2, DollarSign, ChevronLeft, ChevronRight } from "lucide-react"
import { AddFeeDialog } from "@/components/add-fee-dialog"
import { DeleteFeeDialog } from "@/components/delete-fee-dialog"
import { MarkAsPaidDialog } from "@/components/mark-as-paid-dialog"
import { sql } from "@/lib/db"
import Link from "next/link"

const FEES_PER_PAGE = 10

export default function FeesPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; type?: string; page?: string }
}) {
  const router = useRouter()
  const { isValid, isLoading } = useSessionValidation()

  useEffect(() => {
    if (!isLoading && !isValid) {
      router.push("/login")
    }
  }, [isValid, isLoading, router])

  if (isLoading || !isValid) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  const currentPage = parseInt(searchParams.page || "1", 10)
  const offset = (currentPage - 1) * FEES_PER_PAGE

  // Get total count for pagination
  let totalCount = 0
  try {
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM fee_records fr
      JOIN employees e ON fr.employee_id = e.id
      WHERE 1=1
      ${searchParams.search ? sql`AND (e.name ILIKE ${'%' + searchParams.search + '%'} OR fr.description ILIKE ${'%' + searchParams.search + '%'} OR fr.fee_type ILIKE ${'%' + searchParams.search + '%'})` : sql``}
      ${searchParams.status ? sql`AND fr.status = ANY(${searchParams.status.split(',')})` : sql``}
      ${searchParams.type ? sql`AND fr.fee_type = ${searchParams.type}` : sql``}
    `

    totalCount = parseInt(countResult[0]?.total || "0", 10)
  } catch (error) {
    console.error("Error getting fee count:", error)
    totalCount = 0
  }

  // Get paginated fee records
  let queryText = `
      SELECT 
        fr.*, 
        e.name as employee_name,
        e.email as employee_email,
        e.position as employee_position
      FROM fee_records fr
      JOIN employees e ON fr.employee_id = e.id
      WHERE 1=1
    `
  const params: any[] = []
  let paramCount = 0

  if (searchParams.search) {
    paramCount++
    queryText += ` AND (e.name ILIKE $${paramCount} OR fr.description ILIKE $${paramCount} OR fr.fee_type ILIKE $${paramCount})`
    params.push(`%${searchParams.search}%`)
  }

  if (searchParams.status) {
    const statuses = searchParams.status.split(",")
    paramCount++
    queryText += ` AND fr.status = ANY($${paramCount})`
    params.push(statuses)
  }

  if (searchParams.type) {
    paramCount++
    queryText += ` AND fr.fee_type = $${paramCount}`
    params.push(searchParams.type)
  }

  queryText += ` ORDER BY fr.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
  params.push(FEES_PER_PAGE, offset)

  let feeRecords: any[] = []
  try {
    const result = await sql.unsafe(queryText, params)
    feeRecords = result
  } catch (error) {
    console.error("Error fetching fee records:", error)
    feeRecords = []
  }

  // Calculate totals for summary cards
  const totalPending =
    feeRecords?.filter((f) => f.status === "pending").reduce((sum, f) => sum + Number(f.amount), 0) || 0
  const totalOverdue =
    feeRecords?.filter((f) => f.status === "overdue").reduce((sum, f) => sum + Number(f.amount), 0) || 0
  const totalPaid = feeRecords?.filter((f) => f.status === "paid").reduce((sum, f) => sum + Number(f.amount), 0) || 0

  const totalPages = Math.ceil(totalCount / FEES_PER_PAGE)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalOverdue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Successfully collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <form method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by employee name or notes..."
              className="pl-10"
              defaultValue={searchParams.search}
              name="search"
            />
            {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
            {searchParams.type && <input type="hidden" name="type" value={searchParams.type} />}
            {searchParams.page && <input type="hidden" name="page" value="1" />}
          </form>
        </div>
        <div className="flex gap-2">
          <form method="GET">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              defaultValue={searchParams.status || ""}
              name="status"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <button type="submit" className="ml-2 px-3 py-2 border border-gray-300 rounded-md text-sm">Apply</button>
            {searchParams.search && <input type="hidden" name="search" value={searchParams.search} />}
            {searchParams.type && <input type="hidden" name="type" value={searchParams.type} />}
            <input type="hidden" name="page" value="1" />
          </form>
          <form method="GET">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              defaultValue={searchParams.type || ""}
              name="type"
            >
              <option value="">All Types</option>
              <option value="Monthly Membership">Monthly Membership</option>
              <option value="Training Fee">Training Fee</option>
              <option value="Equipment Fee">Equipment Fee</option>
            </select>
            <button type="submit" className="ml-2 px-3 py-2 border border-gray-300 rounded-md text-sm">Apply</button>
            {searchParams.search && <input type="hidden" name="search" value={searchParams.search} />}
            {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
            <input type="hidden" name="page" value="1" />
          </form>
          <AddFeeDialog>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Fee
            </Button>
          </AddFeeDialog>
        </div>
      </div>

      {/* Fee Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records ({totalCount})</CardTitle>
          <CardDescription>
            Manage employee fee payments and track status
            {totalPages > 1 && (
              <span className="ml-2">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feeRecords && feeRecords.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Employee</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Due Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Paid Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeRecords.map((fee) => (
                      <tr key={fee.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{fee.employee_name}</div>
                            <div className="text-sm text-gray-500">{fee.fee_type}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">${Number(fee.amount).toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-900 capitalize">{fee.fee_type}</td>
                        <td className="py-3 px-4 text-gray-900">{new Date(fee.due_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-gray-900">
                          {fee.paid_date ? new Date(fee.paid_date).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              fee.status === "paid"
                                ? "default"
                                : fee.status === "overdue"
                                  ? "destructive"
                                  : fee.status === "pending"
                                    ? "secondary"
                                    : "outline"
                            }
                          >
                            {fee.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {fee.status !== "paid" && (
                              <MarkAsPaidDialog feeId={String(fee.id)} employeeName={fee.employee_name || ""} amount={Number(fee.amount)}>
                                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                              </MarkAsPaidDialog>
                            )}
                            <DeleteFeeDialog feeId={String(fee.id)} employeeName={fee.employee_name || ""}>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DeleteFeeDialog>
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
                    Showing {offset + 1} to {Math.min(offset + FEES_PER_PAGE, totalCount)} of {totalCount} fee records
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link 
                      href={{
                        pathname: "/dashboard/fees",
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
                        pathname: "/dashboard/fees",
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
              <div className="text-gray-500 mb-4">No fee records found</div>
              <AddFeeDialog>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Fee Record
                </Button>
              </AddFeeDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}