import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    await requireAuth()

    const fees = await sql`
      SELECT 
        fr.*,
        e.name as employee_name,
        e.email as employee_email
      FROM fee_records fr
      JOIN employees e ON fr.employee_id = e.id
      ORDER BY fr.created_at DESC
    `

    return NextResponse.json(fees)
  } catch (error) {
    console.error("Error fetching fees:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()

    const { employee_id, amount, fee_type, due_date, notes } = body

    if (!employee_id || !amount || !fee_type || !due_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if due date is in the past to set initial status
    const dueDate = new Date(due_date)
    const today = new Date()
    const status = dueDate < today ? "overdue" : "pending"

    const result = await sql`
      INSERT INTO fee_records (employee_id, amount, fee_type, due_date, notes, status)
      VALUES (${employee_id}, ${amount}, ${fee_type}, ${due_date}, ${notes || null}, ${status})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error creating fee record:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
