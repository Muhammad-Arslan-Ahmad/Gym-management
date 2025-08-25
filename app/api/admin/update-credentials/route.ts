import { NextResponse } from "next/server"
import { query } from "@/lib/db-server"
import { requireAuth, verifyPassword, hashPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currentEmail, currentPassword, newEmail, newPassword } = body || {}

    if (!currentEmail || !currentPassword) {
      return NextResponse.json({ error: "Current email and password are required" }, { status: 400 })
    }

    const userRes = await query(`SELECT * FROM admin_users WHERE id = $1`, [session.user.id])
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const user = userRes.rows[0]

    if (user.email !== currentEmail) {
      return NextResponse.json({ error: "Current email does not match" }, { status: 400 })
    }

    const ok = await verifyPassword(currentPassword, user.password_hash)
    if (!ok) {
      return NextResponse.json({ error: "Invalid current password" }, { status: 400 })
    }

    const updates: string[] = []
    const params: any[] = []
    let i = 0

    if (newEmail && newEmail !== user.email) {
      i += 1
      updates.push(`email = $${i}`)
      params.push(newEmail)
    }
    if (newPassword && newPassword.length >= 6) {
      const hpw = await hashPassword(newPassword)
      i += 1
      updates.push(`password_hash = $${i}`)
      params.push(hpw)
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: true })
    }

    i += 1
    params.push(session.user.id)
    const sql = `UPDATE admin_users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${i} RETURNING id, email, name`
    const updated = await query(sql, params)
    return NextResponse.json({ success: true, user: updated.rows[0] })
  } catch (err: any) {
    console.error("Update credentials error:", err)
    if (err.message?.includes("duplicate key")) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


