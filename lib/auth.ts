import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { cookies } from "next/headers"
import { query } from "./db-server"
import type { AdminUser, Session } from "./db"

const SESSION_COOKIE_NAME = "gm_session"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: number | string): Promise<string> {
  const token = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await query(
    `
      INSERT INTO sessions (session_token, admin_user_id, expires_at)
      VALUES ($1, $2, $3)
    `,
    [token, userId, expiresAt.toISOString()],
  )

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })

  return token
}

export async function getSession(): Promise<{ user: AdminUser; session: Session } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  const result = await query(
    `
      SELECT 
        s.id as session_id,
        s.session_token,
        s.admin_user_id,
        s.expires_at,
        s.created_at as session_created_at,
        u.id as user_id,
        u.email,
        u.password_hash,
        u.name,
        u.created_at as user_created_at,
        u.updated_at as user_updated_at
      FROM sessions s
      JOIN admin_users u ON s.admin_user_id = u.id
      WHERE s.session_token = $1 AND s.expires_at > NOW()
      LIMIT 1
    `,
    [token],
  )

  if (result.rows.length === 0) return null

  const row = result.rows[0]
  return {
    session: {
      id: Number(row.session_id),
      session_token: row.session_token,
      admin_user_id: Number(row.admin_user_id),
      expires_at: row.expires_at,
      created_at: row.session_created_at,
    },
    user: {
      id: Number(row.user_id) as any,
      email: row.email,
      password_hash: row.password_hash,
      name: row.name,
      created_at: row.user_created_at,
      updated_at: row.user_updated_at,
    },
  }
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error("Authentication required")
  }
  return session
}

export async function logout() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (token) {
    await query(`DELETE FROM sessions WHERE session_token = $1`, [token])
  }
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function cleanupExpiredSessions() {
  await query(`DELETE FROM sessions WHERE expires_at <= NOW()`)
}
