import { query as serverQuery } from "./db-server"

export const query = async (text: string, params?: any[]) => {
  return serverQuery(text, params)
}

export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  const chunks = Array.from(strings)
  let parameterized = ""
  const params: any[] = []
  for (let index = 0; index < chunks.length; index++) {
    parameterized += chunks[index]
    if (index < values.length) {
      params.push(values[index])
      parameterized += `$${params.length}`
    }
  }
  const result = await serverQuery(parameterized, params)
  return result.rows
}

export const getFeeRecords = async (filters?: {
  search?: string
  status?: string
  type?: string
}) => {
  let queryText = `
      SELECT 
        fr.*, 
        e.name as employee_name,
        e.email as employee_email,
        e.position as employee_position
      FROM fee_records fr
      JOIN employees e ON fr.employee_id = e.id
      WHERE 1=1
    `
  const params: any[] = []
  let paramCount = 0

  if (filters?.search) {
    paramCount++
    queryText += ` AND (e.name ILIKE $${paramCount} OR fr.description ILIKE $${paramCount} OR fr.fee_type ILIKE $${paramCount})`
    params.push(`%${filters.search}%`)
  }

  if (filters?.status) {
    const statuses = filters.status.split(",")
    paramCount++
    queryText += ` AND fr.status = ANY($${paramCount})`
    params.push(statuses)
  }

  if (filters?.type) {
    paramCount++
    queryText += ` AND fr.fee_type = $${paramCount}`
    params.push(filters.type)
  }

  queryText += ` ORDER BY fr.created_at DESC`

  const result = await serverQuery(queryText, params)
  return result.rows as FeeRecord[]
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
