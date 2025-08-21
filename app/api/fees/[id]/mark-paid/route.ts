import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db-server"
import { requireAuth } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()

    const result = await query(
      `
      UPDATE fee_records 
      SET status = 'paid', paid_date = CURRENT_DATE, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
      [params.id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error marking fee as paid:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
