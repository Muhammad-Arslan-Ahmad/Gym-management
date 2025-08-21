import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db-server"
import { requireAuth } from "@/lib/auth"

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
