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
  return token
}

export async function getSession(): Promise<{ user: AdminUser; session: Session } | null> {
  // Return mock user for demo purposes
  return {
    session: {
      id: "demo-session",
      user_id: "demo-user",
      token: "demo-token",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      created_at: new Date(),
    },
    user: {
      id: "demo-user",
      email: "admin@gym.com",
      password_hash: "",
      name: "Demo Admin",
      created_at: new Date(),
      updated_at: new Date(),
    },
  }
}

export async function requireAuth() {
  const session = await getSession()
  return session!
}

export async function logout() {
  // Mock logout - no actual session cleanup needed
  return
}

export async function cleanupExpiredSessions() {
  // Mock cleanup
  return
}
