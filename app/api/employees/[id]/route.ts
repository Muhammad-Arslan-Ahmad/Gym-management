import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()

    const result = await sql`
      DELETE FROM employees WHERE id = ${params.id}
      RETURNING *
    `

    if (result.length === 0) {
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

    const result = await sql`
      UPDATE employees 
      SET name = ${name}, email = ${email}, phone = ${phone}, position = ${position}, 
          salary = ${salary}, hire_date = ${hire_date}, status = ${status}, updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error updating employee:", error)
    if (error.message?.includes("duplicate key")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
