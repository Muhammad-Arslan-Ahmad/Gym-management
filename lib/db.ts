import { neon } from "@neondatabase/serverless"

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

let sql: any = null

if (databaseUrl) {
  sql = neon(databaseUrl)
} else {
  // Fallback for preview environment - create mock functions
  sql = () => Promise.resolve([])
  console.warn("No database URL found. Using mock database for preview.")
}

export { sql }

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
  created_at?: string
  employee_name?: string
  employee_email?: string
}

export interface Session {
  id: number
  session_token: string
  admin_user_id: number
  expires_at: string
  created_at: string
}
