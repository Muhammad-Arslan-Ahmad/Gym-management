import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db-server"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()

    const result = await query(
      `
      SELECT 
        fr.*, e.name as employee_name, e.email as employee_email
      FROM fee_records fr
      JOIN employees e ON fr.employee_id = e.id
      WHERE fr.id = $1
    `,
      [params.id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching fee record:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()

    const result = await query(
      `
      DELETE FROM fee_records WHERE id = $1
      RETURNING *
    `,
      [params.id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting fee record:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()
    const body = await request.json()

    const allowedFields = ["employee_id", "amount", "fee_type", "due_date", "paid_date", "status", "description"]
    const setClauses: string[] = []
    const values: any[] = []
    let idx = 0

    for (const key of allowedFields) {
      if (key in body) {
        idx += 1
        setClauses.push(`${key} = $${idx}`)
        values.push(body[key])
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "No valid fields provided" }, { status: 400 })
    }

    const queryText = `
      UPDATE fee_records
      SET ${setClauses.join(", ")}, updated_at = NOW()
      WHERE id = $${idx + 1}
      RETURNING *
    `
    values.push(params.id)

    const result = await query(queryText, values)
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error updating fee record:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
