import { Pool } from "pg"

// Server-side PostgreSQL connection (only for API routes)
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString:
        process.env.DATABASE_URL || "postgresql://gym_admin:gym_password_2024@localhost:5432/gym_management",
      ssl: false,
    })
  }
  return pool
}

export async function query(text: string, params?: any[]) {
  const pool = getPool()
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

// Database types
export interface AdminUser {
  id: number
  email: string
  password_hash: string
  name: string
  created_at: string
  updated_at: string
}

export interface Employee {
  id: number
  name: string
  email: string
  phone?: string
  position: string
  salary: number
  hire_date: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface FeeRecord {
  id: number
  employee_id: number
  amount: number
  fee_type: string
  due_date: string
  paid_date?: string
  status: "pending" | "paid" | "overdue"
  description?: string
  created_at: string
  updated_at: string
  employee_name?: string
  employee_email?: string
}

export interface Reminder {
  id: number
  employee_id: number
  fee_record_id?: number
  message: string
  sent_at: string
  reminder_type: "payment_due" | "overdue_payment" | "general"
  status: "sent" | "pending" | "failed"
  created_at: string
  employee_name?: string
  employee_email?: string
  fee_records?: {
    amount: number
    fee_type: string
    due_date: string
  }
}
