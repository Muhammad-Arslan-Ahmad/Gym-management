import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db-server"
import { requireAuth } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()

    const result = await query(
      `
      DELETE FROM employees WHERE id = $1
      RETURNING *
    `,
      [params.id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()
    const body = await request.json()

    const { name, email, phone, position, salary, hire_date, status } = body

    const result = await query(
      `
      UPDATE employees 
      SET name = $1, email = $2, phone = $3, position = $4, 
          salary = $5, hire_date = $6, status = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `,
      [name, email, phone, position, salary, hire_date, status, params.id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error("Error updating employee:", error)
    if (error.message?.includes("duplicate key")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
