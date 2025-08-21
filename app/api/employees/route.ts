import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    await requireAuth()

    const employees = await sql`
      SELECT * FROM employees 
      WHERE status = 'active'
      ORDER BY name ASC
    `

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()

    const { name, email, phone, position, salary, hire_date, status } = body

    if (!name || !email || !position || !hire_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO employees (name, email, phone, position, salary, hire_date, status)
      VALUES (${name}, ${email}, ${phone || null}, ${position}, ${salary || null}, ${hire_date}, ${status || "active"})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error creating employee:", error)
    if (error.message?.includes("duplicate key")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
