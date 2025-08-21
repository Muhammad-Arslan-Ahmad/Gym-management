import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db-server"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    await requireAuth()

    // Get overdue and pending fees
    const overdueFeesResult = await query(`
      SELECT 
        fr.*,
        e.name as employee_name,
        e.email as employee_email,
        e.position
      FROM fee_records fr
      JOIN employees e ON fr.employee_id = e.id
      WHERE fr.status IN ('pending', 'overdue')
      ORDER BY fr.due_date ASC
    `)

    // Get recent reminders
    const recentRemindersResult = await query(`
      SELECT 
        r.*,
        e.name as employee_name,
        e.email as employee_email,
        fr.amount,
        fr.fee_type,
        fr.due_date
      FROM reminders r
      JOIN employees e ON r.employee_id = e.id
      LEFT JOIN fee_records fr ON r.fee_record_id = fr.id
      ORDER BY r.sent_at DESC
      LIMIT 10
    `)

    return NextResponse.json({
      overdueFeesData: overdueFeesResult.rows,
      recentReminders: recentRemindersResult.rows,
    })
  } catch (error) {
    console.error("Error fetching reminders data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()

    const { employee_id, fee_record_id, message, reminder_type } = body

    if (!employee_id || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await query(
      `
      INSERT INTO reminders (employee_id, fee_record_id, message, reminder_type, sent_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `,
      [employee_id, fee_record_id || null, message, reminder_type || "payment_due"],
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating reminder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
