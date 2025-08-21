import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()

    const result = await sql`
      UPDATE fee_records 
      SET status = 'paid', paid_date = CURRENT_DATE, updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error marking fee as paid:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
