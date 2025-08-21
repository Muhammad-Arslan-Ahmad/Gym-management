import { sql } from "./db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import type { AdminUser, Session } from "./db"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string): Promise<string> {
  const token = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `

  const cookieStore = cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return token
}

export async function getSession(): Promise<{ user: AdminUser; session: Session } | null> {
  const cookieStore = cookies()
  const token = cookieStore.get("session")?.value

  if (!token) return null

  const result = await sql`
    SELECT 
      s.*,
      u.id as user_id,
      u.email,
      u.name,
      u.created_at as user_created_at,
      u.updated_at as user_updated_at
    FROM sessions s
    JOIN admin_users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `

  if (result.length === 0) return null

  const row = result[0] as any
  return {
    session: {
      id: row.id,
      user_id: row.user_id,
      token: row.token,
      expires_at: row.expires_at,
      created_at: row.created_at,
    },
    user: {
      id: row.user_id,
      email: row.email,
      password_hash: "", // Don't return password hash
      name: row.name,
      created_at: row.user_created_at,
      updated_at: row.user_updated_at,
    },
  }
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}

export async function logout() {
  const cookieStore = cookies()
  const token = cookieStore.get("session")?.value

  if (token) {
    await sql`DELETE FROM sessions WHERE token = ${token}`
  }

  cookieStore.delete("session")
  redirect("/login")
}

export async function cleanupExpiredSessions() {
  await sql`DELETE FROM sessions WHERE expires_at < NOW()`
}
