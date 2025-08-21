"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { AddEmployeeDialog } from "@/components/add-employee-dialog"

interface EmployeeSearchProps {
  searchParams: { search?: string; status?: string }
}

export function EmployeeSearch({ searchParams }: EmployeeSearchProps) {
  const router = useRouter()
  const currentSearchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(searchParams.search || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(currentSearchParams)
    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }
    startTransition(() => {
      router.push(`/dashboard/employees?${params.toString()}`)
    })
  }

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(currentSearchParams)
    if (status) {
      params.set("status", status)
    } else {
      params.delete("status")
    }
    startTransition(() => {
      router.push(`/dashboard/employees?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search employees by name, email, or position..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isPending}
          />
        </form>
      </div>
      <div className="flex gap-2">
        <select
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          value={searchParams.status || ""}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isPending}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <AddEmployeeDialog>
          <Button className="bg-blue-600 hover:bg-blue-700" disabled={isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </AddEmployeeDialog>
      </div>
    </div>
  )
}
