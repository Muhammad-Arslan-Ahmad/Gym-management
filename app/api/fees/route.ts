import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db-server"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    let queryText = `
      SELECT 
        fr.*,
        e.name as employee_name,
        e.email as employee_email
      FROM fee_records fr
      JOIN employees e ON fr.employee_id = e.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramCount = 0

    if (search) {
      paramCount++
      queryText += ` AND (e.name ILIKE $${paramCount} OR fr.description ILIKE $${paramCount} OR fr.fee_type ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    if (status) {
      const statuses = status.split(",")
      paramCount++
      queryText += ` AND fr.status = ANY($${paramCount})`
      params.push(statuses)
    }

    if (type) {
      paramCount++
      queryText += ` AND fr.fee_type = $${paramCount}`
      params.push(type)
    }

    queryText += ` ORDER BY fr.created_at DESC`

    const result = await query(queryText, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching fees:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()

    const { employee_id, amount, fee_type, due_date, description } = body

    if (!employee_id || !amount || !fee_type || !due_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if due date is in the past to set initial status
    const dueDate = new Date(due_date)
    const today = new Date()
    const status = dueDate < today ? "overdue" : "pending"

    const result = await query(
      `
      INSERT INTO fee_records (employee_id, amount, fee_type, due_date, description, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [employee_id, amount, fee_type, due_date, description || null, status],
    )

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error("Error creating fee record:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
